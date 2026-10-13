import bcrypt from 'bcryptjs';
import User from '../models/User';
import sendEmail from '../sendEmail';
import { generateToken } from '../auth';
import { json, readBody } from '../http';

export const registerUser = async (request) => {
  try {
    const { name, email, password, role } = await readBody(request);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return json({ message: 'User already exists' }, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sign-up can only create buyers or sellers. Admins are made from the
    // admin User Management page, never from a public request.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'seller' ? 'seller' : 'buyer',
    });

    if (user) {
      return json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      }, 201);
    } else {
      return json({ message: 'Invalid user data' }, 400);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const loginUser = async (request) => {
  try {
    const { email, password } = await readBody(request);

    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isSuspended) {
        return json({ message: 'Your account has been suspended. Please contact support.' }, 403);
      }
      return json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return json({ message: 'Invalid credentials' }, 401);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const forgotPassword = async (request) => {
  try {
    const body = await readBody(request);
    const user = await User.findOne({ email: body.email });
    if (!user) return json({ message: 'There is no user with that email.' }, 404);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send Email
    const message = `Your password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'LetRank - Password Reset OTP',
        text: message
      });
      return json({ message: 'OTP sent to email!' }, 200);
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return json({ message: 'Email could not be sent' }, 500);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const resetPassword = async (request) => {
  try {
    const { email, otp, newPassword } = await readBody(request);

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return json({ message: 'Invalid or expired OTP' }, 400);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return json({ message: 'Password has been updated successfully' }, 200);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
