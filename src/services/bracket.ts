export interface Album {
  name?: string;
  artist?: string;
  cover?: string;
}

export interface Matchup {
  home: Album;
  away: Album;
}

export class Bracket {
  winner: Album = {};
  initialBracket: any[] = [];
  quarterFinalBracket: any[] = [];
  semiFinalBracket: any[] = [];
  finalBracket: any[] = [];
  round: number = 1;

  createBracket(albums: any) {
    albums.forEach((album: any) => {
      this.initialBracket.push({
        name: album.name,
        artist: album.artist,
        cover: album.cover,
      });
    });
  }

  getNextMatch() {
    if (this.round <= 8) {
      return { home: this.initialBracket[0], away: this.initialBracket[1] };
    }
    if (this.round <= 12) {
      return {
        home: this.quarterFinalBracket[0],
        away: this.quarterFinalBracket[1],
      };
    }
    if (this.round <= 14) {
      return { home: this.semiFinalBracket[0], away: this.semiFinalBracket[1] };
    }
    return { home: this.finalBracket[0], away: this.finalBracket[1] };
  }

  decideMatch(match: Matchup, selection: string) {
    const winner = selection === "home" ? match.home : match.away;
    if (this.round <= 8) {
      this.quarterFinalBracket.push(winner);
      this.initialBracket.splice(0, 2);
    }
    if (this.round <= 12 && this.round > 8) {
      this.semiFinalBracket.push(winner);
      this.quarterFinalBracket.splice(0, 2);
    }
    if (this.round <= 14 && this.round > 12) {
      this.finalBracket.push(winner);
      this.semiFinalBracket.splice(0, 2);
    }
    if (this.round > 14 && this.finalBracket.length === 2) {
      this.winner = winner;
    }

    this.round += 1;
  }

  getWinner() {
    return this.winner;
  }
}
