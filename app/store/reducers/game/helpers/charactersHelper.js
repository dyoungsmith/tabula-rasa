import _ from 'lodash';

export default function assignCharacters (playerIds) {
  const numPlayers = playerIds.length;

  let chars = [];
  let good = 0;
  let bad = 0;

  // determine number of good and bad characters
  if (numPlayers === 5) {
    good += 3;
    bad += 2;
  } else if (numPlayers === 6) {
    good += 4;
    bad += 2;
  } else if (numPlayers === 7) {
    good += 4;
    bad += 3
  } else if (numPlayers === 8) {
    good += 5;
    bad += 3;
  } else if (numPlayers === 9) {
    good += 6;
    bad += 3
  } else {
    good += 6;
    bad += 4;
  }

  // add remaining characters, including assassin and merlin
  chars.push({
    loyalty: 'evil',
    character: 'assassin',
  });
  bad--;
  chars.push({
    loyalty: 'good',
    character: 'merlin',
  });
  good--;

  // fill in with servants or minions
  while (good > 0) {
    chars.push({
      loyalty: 'good',
      character: 'servant',
    });
    good--;
  }
  while (bad > 0) {
    chars.push({
      loyalty: 'evil',
      character: 'minion',
    });
    bad--;
  }

  // shuffle characters
  chars = _.shuffle(chars);

  // assign characters to players
  return playerIds.map((playerId, i) => Object.assign({ playerId }, chars[i]));

};
