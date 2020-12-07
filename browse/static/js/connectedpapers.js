(function () {
  const REST_ADDR = 'https://rest.migration.connectedpapers.com/';
  const CONNECTED_PAPERS_ADDR = 'https://www.connectedpapers.com/';
  const ARXIV_THUMBNAILS_ADDR = CONNECTED_PAPERS_ADDR + 'arxiv_thumbnails/';
  
  var $output = $('#connectedpapers-output');
  var arxivId = window.location.pathname.split('/').reverse()[0];
  var arxivIdToCPIdUrl = REST_ADDR + '?arxiv=' + arxivId;
  var communicationErrorHtml = '<p>Oops, seems like communiation with the Connected Papers server is down.</p>';
  var idNotRecognizedHtml = '<p>Seems like this paper is still not in our database. Please try again in a few days.</p>';
  
  
  $.get(arxivIdToCPIdUrl).done(translationResponse => {
    console.log("AAA");
    if (translationResponse == null) {
      $output.html(idNotRecognizedHtml);
      return;
    }
    var paperId = translationResponse.paperId;
    var title = translationResponse.title;

    if (paperId.length == 0 || title.length == 0) {
      $output.html(idNotRecognizedHtml);
      return;
    }

    var versionsFetchUrl = REST_ADDR + '?versions=' + paperId;

    console.log("BBB");
    
    $.get(versionsFetchUrl).done(versionsResponse => {
      console.log("CCC");
      const NUMBER_OF_THUMBNAILS = 18;
      
      var graphUrl = CONNECTED_PAPERS_ADDR + 'main/' + paperId + '/graph';
      var buildGraphLinkHtml = '<a href="' + graphUrl + '" target="_blank"><p style="margin:0;">View graph for ' + title + '.</p></a>';
      var seeGraphLinkHtml = '<a href="' + graphUrl + '" target="_blank"><p style="margin:0;">View graph for ' + title + '.</p></a>';
      var graphNotVisual = '<p>Seems like ' + title + ' is still not in our database. Please try again in a few days.</p>';

      function getRandomInt(max) {
        return Math.floor(Math.random() * (max + 1));
      }

      var chosenGraph = ARXIV_THUMBNAILS_ADDR + 'g' + getRandomInt(NUMBER_OF_THUMBNAILS) + '.jpg';
      var choserGraphHtml = '<img src="' + chosenGraph + '" alt="Example graph image" width="120" height="100">';

      var containerDivStyle = '"display: flex; flex-flow: row; padding: 24px 10px;"';
      var infoLine = '<p style="font-size: 12px; opacity: 0.5; margin-top: 0; margin-bottom: 10px;">Find and explore related papers in a visual graph</p>';

      var textDivOpen = '<div style="display: flex; flex-flow: column; padding: 0px 25px;">';
      var buildGraphTextDiv = textDivOpen + infoLine + buildGraphLinkHtml + '</div>';
      var seeGraphTextDiv = textDivOpen + infoLine + seeGraphLinkHtml + '</div>';

      var buildGraphHtml = '<div style=' + containerDivStyle + '>' + choserGraphHtml + buildGraphTextDiv + '</div>';
      var seeGraphHtml = '<div style=' + containerDivStyle + '>' + choserGraphHtml + seeGraphTextDiv + '</div>';

      if (versionsResponse == null) {
        $output.html(buildGraphHtml);
        return;
      }
      var versionsData = versionsResponse.result_dates;
      if (versionsData.length == 0) {
        $output.html(buildGraphHtml);
        return;
      }
      var mostRecentVersion = versionsData[versionsData.length - 1];
      if (mostRecentVersion.visual) {
        $output.html(seeGraphHtml);
        return;
      }
      if (versionsResponse.rebuild_available) {
        $output.html(buildGraphHtml);
        return;
      }
      $output.html(graphNotVisual);
    }).fail(versionsResponse => {
      $output.html(communicationErrorHtml);
    })
  }).fail(translationResponse => {
    $output.html(communicationErrorHtml);
  });
})();
