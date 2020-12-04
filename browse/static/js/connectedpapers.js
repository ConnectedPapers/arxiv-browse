(function () {
  var $output = $('#connectedpapers-output');
  var restAddr = 'https://rest.beta.connectedpapers.com:1443/';
  var connectedPapersAddr = 'https://site.beta.connectedpapers.com/';
  var arxivId = window.location.pathname.split('/').reverse()[0];
  var arxivIdToCPIdUrl = restAddr + '?arxiv=' + arxivId;
  var communicationErrorHtml = '<p>Communication with the connection papers server failed.</p>';
  var idNotRecognizedHtml = '<p>ArxivID not recognized. Please try again in a few days.</p>';
  $.get(arxivIdToCPIdUrl).done(translationResponse => {
    if (translationResponse == null) {
      $output.html(idNotRecognizedHtml);
      return;
    }
    var paperId = translationResponse.paperId;
    var title = translationResponse.title;
    var versionsFetchUrl = restAddr + '?versions=' + paperId;
    $.get(versionsFetchUrl).done(versionsResponse => {
      var graphUrl = connectedPapersAddr + 'main/' + paperId + '/graph';
      var buildGraphHtml = '<a href="' + graphUrl + '" target="_blank"><p>Click here to build graph for ' + title + '.</p></a>';
      var seeGraphHtml = '<a href="' + graphUrl + '" target="_blank"><p>Click here to see graph for ' + title + '.</p></a>';
      var graphNotVisual = '<p>paper ' + title + ' not parsed yet. Please try again in a few days.</p>';
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
