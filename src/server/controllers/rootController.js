const rootController = (function () {
  const rootController = {
    home(req, res) {
      res.render("screens/root/home", { pageTitle: "Home" });
    },
  };

  return rootController;
})();

export default rootController;
