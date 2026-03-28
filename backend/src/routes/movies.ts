import { Router } from "express";

const router = Router();

// Cette route est dépréciée - les films ne peuvent être ajoutés que via TMDB API
// Utilisez l'endpoint /api/watchlist pour ajouter des films à votre watchlist

// GET placeholder
router.get("/", (req, res) => {
  res.status(410).json({
    error: "Endpoint supprimé",
    message: "Les films ne peuvent être ajoutés que via l'API TMDB",
    hint: "Utilisez POST /api/watchlist pour ajouter un film à votre watchlist",
  });
});

// POST placeholder
router.post("/", (req, res) => {
  res.status(410).json({
    error: "Endpoint supprimé",
    message: "Les films ne peuvent être ajoutés que via l'API TMDB",
    hint: "Utilisez POST /api/watchlist pour ajouter un film à votre watchlist",
  });
});
// Ancien GET movie by ID - placeholder
router.get("/:id", (req, res) => {
  res.status(410).json({
    error: "Endpoint supprimé",
    message: "Les films ne peuvent être consultés que via l'API TMDB",
  });
});

// Ancien POST create movie - placeholder
router.post("/", (req, res) => {
  res.status(410).json({
    error: "Endpoint supprimé",
    message: "Les films ne peuvent être ajoutés que via l'API TMDB",
    hint: "Utilisez POST /api/watchlist pour ajouter un film à votre watchlist",
  });
});

// Ancien PUT update movie - placeholder
router.put("/:id", (req, res) => {
  res.status(410).json({
    error: "Endpoint supprimé",
    message: "Utilisez PUT /api/watchlist/:id/status pour changer le statut",
  });
});

// Ancien DELETE movie - placeholder
router.delete("/:id", (req, res) => {
  res.status(410).json({
    error: "Endpoint supprimé",
    message:
      "Utilisez DELETE /api/watchlist/:id pour retirer de votre watchlist",
  });
});

export default router;
