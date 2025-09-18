import {app} from "./api/app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error: any) => {
  error ? console.log("error", error) : console.log("Server is running on port 3000");
});