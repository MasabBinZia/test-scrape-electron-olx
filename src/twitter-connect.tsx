import { useEffect, useState } from "react";

import {
  getTwitterUsername,
  initiateTwitterAuth,
  logoutTwitter,
} from "./native.utils";

import {
  useSetTwitterLoggedIn,
  useTwitterLoggedIn,
} from "../src/store/app-store";

export function TwitterConnect() {
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState("");
  const twitterLoggedIn = useTwitterLoggedIn();
  const setTwitterLoggedIn = useSetTwitterLoggedIn();

  async function openTwitterAuth() {
    try {
      setConnecting(true);
      const loggedIn = await initiateTwitterAuth();
      setTwitterLoggedIn(loggedIn);
      if (!loggedIn) {
        alert({
          description: "Could not connect to account",
          variant: "destructive",
        });
      } else {
        alert({
          description: "Connected",
        });
      }
    } catch (e) {
      alert({
        description: "Could not connect to account",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    if (twitterLoggedIn) {
      void getTwitterUsername()
        .then(setUsername)
        .catch(() => {});
    }
  }, [twitterLoggedIn]);

  function disconnectTwitter() {
    void logoutTwitter();
    setTwitterLoggedIn(false);
    setUsername("");
  }

  return (
    <div className="">
      <h1 className="">Connect Account</h1>
      <div className="">
        <div className="">
          <p className="">{username ? `@${username}` : "Connect to X"}</p>
          <p>• {twitterLoggedIn ? "Connected" : "Not connected"}</p>
        </div>

        {!connecting && (
          <button
            className="button-19"
            onClick={() =>
              twitterLoggedIn ? disconnectTwitter() : void openTwitterAuth()
            }
          >
            {twitterLoggedIn ? "Disconnect" : "Connect"}
          </button>
        )}

        {connecting && <div className="self-center mt-7">loading ...</div>}
      </div>
    </div>
  );
}
