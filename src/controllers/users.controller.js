import * as usersService from "../services/users.service.js";

export async function register(req, res, next) {
  try {
    const { user, token } = await usersService.registerUser(req.body);
    res.status(201).json({
      success: true, message: "ثبت‌نام با موفقیت انجام شد", token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { user, token } = await usersService.loginUser(req.body.email, req.body.password);
    res.json({
      success: true, message: "خوش آمدید", token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) { next(err); }
}

export async function me(req, res) {
  res.json({ success: true, user: req.currentUser });
}