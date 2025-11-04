// ...existing code...
import { Platform } from "react-native";
import firebase from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";

export async function testFirebaseInit() {
  try {
    // check default app exists
    const hasApp = !!(firebase && firebase.app);
    console.log("Firebase available:", hasApp);

    if (hasApp) {
      try {
        // firebase.app() returns the default app
        const app = firebase.app();
        console.log("Firebase app name:", app?.name ?? "<no-name>");
        // some builds expose options — log if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options = (app as any)?.options;
        if (options) {
          console.log("Firebase app options keys:", Object.keys(options));
        } else {
          console.log("Firebase app options: <not available>");
        }
      } catch (e) {
        console.log("Error reading firebase.app():", e);
      }
    }
  } catch (err) {
    console.log("Firebase initialization check failed:", err);
  }
}
// ...existing code...