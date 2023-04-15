import axios from "axios";

export class Spotify {
  constructor() {
    console.log("I was created");
  }

  async getTopArtists(token: string) {
    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          time_range: "long_term",
          limit: 30,
        },
      }
    );

    let artistLinkList: any[] = [];

    data.items.forEach((artist: { href: any }) => {
      artistLinkList.push(artist.href);
    });

    return artistLinkList;
  }

  async getAllAlbumsOfArtists(token: string) {
    const artistLinkList = await this.getTopArtists(token);

    let albumNames: any[] = [];
    for (const link of artistLinkList) {
      const id = link.substring(link.lastIndexOf("/") + 1);
      const { data } = await axios.get(
        `https://api.spotify.com/v1/artists/${id}/albums`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            include_groups: "album",
            limit: 20,
          },
        }
      );

      data.items.forEach((item: any) => {
        const albumInfo = {
          name: item.name,
          cover: item.images[0].url,
          album_type: item.album_type,
          artist: item.artists[0].name,
        };
        if (item.total_tracks >= 5) {
          albumNames.push(albumInfo);
        }
      });
    }

    return albumNames.sort(() => 0.5 - Math.random()).slice(0, 16);
  }
}
