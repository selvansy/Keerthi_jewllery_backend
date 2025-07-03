class AuthController {
  constructor(loginUseCase) {
    this.loginUseCase = loginUseCase;
  }

  async login(req, res) {
    const { username, password } = req.body;

    try {
      const result = await this.loginUseCase.findByUsername(username, password);

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          token: result.token,
          menuData: result.menuData
        });
      }

      if (
        result.message === "User not found" ||
        result.message === "Invalid password"
      ) {
        return res.status(400).json({ message: result.message });
      }

      if (result.message === "User is deactivated") {
        return res.status(403).json({ message: result.message });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AuthController;
