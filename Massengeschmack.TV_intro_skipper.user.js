// ==UserScript==
// @name        Massengeschmack.TV intro skipper
// @namespace   https://github.com/irgendsontyp/greasemonkey-user-scripts
// @description Skips intros some shows on massengeschmack.tv
// @include     https://massengeschmack.tv/play/*
// @version     1.0
// @grant       none
// @run-at      document-idle
// ==/UserScript==
// Try to get the flowplayer API object
var flowplayerApi = flowplayer();

if (!flowplayerApi)
{
    console.error("Unable to get an instance of the flowplayer API.");

    return;
}

/* The intro shall only be skipped when the video has never
   been watched before by the user. We determine this by setting
   the folliwing flag to true when flowplayer is told by massengeschmack.tv
   to jump to a certain position, which is the last remembered play
   position
*/
var isVideoBeingWatchedFirstTime = true;

/* Returns the time in seconds per show, at which the intro is over */
function getSecondsToJumpByShowId(showId)
{
  switch (showId)
    {
      case 'asynchron':
        return 25;

      case 'comictalk':
          return 17;

      case 'fktv':
          return 26;

      case 'fktvplus':
          return 5;

      case 'hoaxilla':
          return 43;

      case 'netzprediger':
          return 26;

      case 'pasch':
          return 31;

      case 'ps':
        return 51;

      case 'ptv':
        return 26;

      case 'serienkiller':
        return 20;

      case 'sprechplanet':
        return 23;
    }

    return null;
}

/* Extracts the unique show identifier from the given URL */
function extractShowIdFromUrl(url)
{
  var result = /\/play\/([a-z]+)/i.exec(url);

  if (!result)
  {
    return null;
  }

  return result[1];
}


/*
   Attach a handler to flowplayer's "beforeseek" event so we can
   determine whether the video is being watched for the first time
*/
flowplayerApi.on
(
  "beforeseek"
  , function()
  {
    /* This video has been watched before */
    isVideoBeingWatchedFirstTime = false;
  }
);

/*
  Attach a handler for skipping the intro if the video is being watched
  for the first time
*/
flowplayerApi.on
(
  "beforeresume"
  , function(event, flowPlayerInstance)
  {
    if (isVideoBeingWatchedFirstTime)
    {
      /* Extract the show id from the current location's URL */
      var showId = extractShowIdFromUrl(location.href);

      if (showId === null)
      {
        console.error("Could not extract show id from URL.");

        return;
      }

      /* Find position after intro */
      var positionAfterIntro = getSecondsToJumpByShowId(showId);

      if (positionAfterIntro === null)
      {
        console.error("Could not find the position after intro for the show with id \"%s\".", showId);

        return;
      }

      /* Skip intro! */
      flowPlayerInstance.seek(positionAfterIntro);
    }
  }
);