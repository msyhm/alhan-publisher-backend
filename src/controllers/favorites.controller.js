import * as favoritesService from "../services/favorites.service.js";

export async function getFavorites(req, res, next) {
  try {
    const books = await favoritesService.getFavoritesForUser(req.currentUser.id);
    res.json({ success: true, books });
  } catch (err) { next(err); }
}

export async function addFavorite(req, res, next) {
  try {
    await favoritesService.addFavorite(req.currentUser.id, req.params.bookId);
    res.status(201).json({ success: true, message: "به علاقه‌مندی‌ها اضافه شد" });
  } catch (err) { next(err); }
}

export async function removeFavorite(req, res, next) {
  try {
    await favoritesService.removeFavorite(req.currentUser.id, req.params.bookId);
    res.json({ success: true, message: "از علاقه‌مندی‌ها حذف شد" });
  } catch (err) { next(err); }
}