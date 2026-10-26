import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import {config} from "../config/config.js"
import crypto from "node:crypto";
import nodemailer from "nodemailer";

const createEmailTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: config.GMAIL_USER,
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            refreshToken: config.GMAIL_REFRESH_TOKEN
        }
    });
};

async function sendTokenResponse(user,res,message){
   const token = jwt.sign({
      id: user._id,
   },config.JWT_SECRET,{
    expiresIn: "7d"
   })

   res.cookie("token",token)

   res.status(200).json({
    message,
    success: true,
    token,
    user:{
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullname: user.fullName,
        role: user.role
    }
   })
}

export const register = async(req,res)=>{
    const {email, contact, password, fullName} = req.body

    try{
        const existingUser = await userModel.findOne({
            $or: [
                {email},
                {contact}
            ]
        })
        if(existingUser){
            return res.status(400).json({message: "User with this email or contact already exists"})
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullName,
            role: "buyer"
        })

        await sendTokenResponse(user,res,"User registered successfully!")
    }catch(error){
        console.log(error)
        return res.status(500).json({message: "Error registering user"})
    }
}

export const Login = async(req,res)=>{
   const {email,password} = req.body
   
   const user = await userModel.findOne({email})

   if(!user){
    return res.status(400).json({
        message: "Invalid email or password"
    })
   }

   const isMatch = await user.comparePassword(password)

   if(!isMatch){
    return res.status(400).json({
       message: "User logged in Successfully"
    })
   }

   await sendTokenResponse(user,res, "User logged in successfully")
}

export const googleCallback = async(req,res)=>{
    const {id, displayName, emails, photos} = req.user

    const email = emails[0].value
    const profilePic = photos[0].value

    let user = await userModel.findOne({
        email
    })

    if(!user){
        user = await userModel.create({
            email,
            googleId: id,
            fullName: displayName
        })
    }

    const token = jwt.sign({
        id: user._id,    
    },config.JWT_SECRET,{
        expiresIn: "7d"
    })

    res.cookie("token",token)

    res.redirect("http://localhost:5174/")
}


export const forgotPassword = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();

    // Same response denge, chahe email registered ho ya nahi
    const genericMessage =
        "If an account exists for this email, a reset link will be sent.";

    if (!email) {
        return res.status(200).json({
            success: true,
            message: genericMessage
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        // Google-only account ke liye local password reset allow nahi
        if (!user.password) {
            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        // Secure random token generate karo
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Database mein raw token nahi, hash store karo
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const resetUrl =
            `http://localhost:5173/reset-password/${resetToken}`;

        const transporter = createEmailTransporter();

        await transporter.sendMail({
            from: config.GMAIL_USER,
            to: user.email,
            subject: "Dulhan-Gifts Password Reset",
            text:
                `We received a password reset request for your account.\n\n` +
                `Open this link to reset your password (valid for 15 minutes):\n` +
                `${resetUrl}\n\n` +
                `If you did not request this, you can ignore this email.`
        });

        return res.status(200).json({
            success: true,
            message: genericMessage
        });
    } catch (error) {
        console.error("Forgot password error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to process the request right now."
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // 1. Validate the new password
        if (
            typeof password !== "string" ||
            password.length < 8
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        // 2. Hash the token received from the reset link
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // 3. Find the user with a valid, unexpired reset token
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset link is invalid or has expired."
            });
        }

        // 4. Update the password and invalidate the reset token
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // 5. Save user; your pre-save middleware hashes the password
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in."
        });

    } catch (error) {
        console.error("Reset password error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to reset password right now."
        });
    }
};
