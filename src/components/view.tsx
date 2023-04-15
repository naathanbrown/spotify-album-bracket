import { useEffect, useState } from "react";
import { Album, Bracket, Matchup } from "../services/bracket";
import { Spotify } from "../services/spotify";

const spotify = new Spotify();
const bracketManager = new Bracket();

export const View = () => {
  const CLIENT_ID = "f30b1e0347194467b79f859c279ba8e7";
  const REDIRECT_URI =
    process.env.NODE_ENV === "production"
      ? "https://naathanbrown.github.io/spotify-album-bracket/"
      : "http://localhost:3000/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-top-read";

  const [token, setToken] = useState("");
  const [match, setMatch] = useState<Matchup | null>();
  const [winner, setWinner] = useState<Album | null>();
  const [debug, setDebug] = useState<String | null>();

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token =
        hash
          ?.substring(1)
          ?.split("&")
          ?.find((elem) => elem.startsWith("access_token"))
          ?.split("=")[1] || "";

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token as unknown as string);
  }, []);

  function logout() {
    setToken("");
    window.localStorage.removeItem("token");
  }

  async function searchArtist() {
    try {
      return await spotify.getAllAlbumsOfArtists(token);
    } catch (err) {
      window.localStorage.setItem("token", "");
      setDebug(`DEBUG: ${JSON.stringify(err)}`);
      setToken("");
    }
  }

  async function generateBracket() {
    const albums = await searchArtist();
    bracketManager.createBracket(albums);
    setMatch(bracketManager.getNextMatch());
  }

  function decideMatch(selection: string) {
    bracketManager.decideMatch(match!, selection);
    const possibleWin = bracketManager.getWinner();
    if (possibleWin.name) {
      setMatch(null);
      setWinner(possibleWin);
    } else {
      setMatch(bracketManager.getNextMatch());
    }
  }

  const divStyle = {
    display: "flex",
  };

  return (
    <>
      {token === "" && (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
        >
          Login to Spotify
        </a>
      )}
      {token !== "" && (
        <>
          <input
            type="button"
            onClick={generateBracket}
            value="Generate Bracket"
          />
          <input type="button" onClick={logout} value="Logout" />
        </>
      )}
      {match && (
        <div style={divStyle}>
          <div>
            <p>
              {match?.home?.name} - {match?.home?.artist}
            </p>
            <img
              src={match?.home?.cover}
              alt="new"
              onClick={() => decideMatch("home")}
              height="250"
              width="250"
            />
          </div>
          <div>
            <p> vs </p>
          </div>
          <div>
            <p>
              {match?.away?.name} - {match?.away?.artist}
            </p>
            <img
              src={match?.away?.cover}
              alt="new"
              onClick={() => decideMatch("away")}
              height="250"
              width="250"
            />
          </div>
        </div>
      )}
      {winner && (
        <div>
          <p>
            {winner?.name} - {winner.artist}
          </p>
          <img src={winner.cover} alt="new" height="250" width="250" />
        </div>
      )}
      {debug && <p> {debug}</p>}
    </>
  );
};
