// ==UserScript==
// @name         nkm
// @namespace    nkm
// @version      0.2.0
// @description  Archive your messages
// @author       Maksymilian Bolek
// @homepage     https://github.com/makbol/nkm
// @supportURL   https://github.com/makbol/nkm/issues
// @updateURL    https://raw.githubusercontent.com/makbol/nkm/master/nkm.user.js
// @downloadURL  https://raw.githubusercontent.com/makbol/nkm/master/nkm.user.js
// @match        http://nk.pl/*
// @grant        none
// @run-at       document-idle
// @require      https://cdn.jsdelivr.net/g/momentjs@2.11.2,jquery@2.2.0,lodash@4.3.0
// ==/UserScript==

if(self != top ) {

  if(localStorage.getItem('nkm-done')) {
    loadMessages();
    return;
  }

  var records = localStorage.getItem('messages');
  var nextPage = $('.paginator .next');

  records = (records) ? JSON.parse(records) : {};

  $('.inbox li.row').each(function(i, el) {
    var $el      = $(el);
    var from     = $el.find('.od a').attr('title');
    var time     = $el.find('.od .time').text();
    var href     = $el.find('.msg a').attr('href');
    var isInvite = $el.hasClass('invite');
    var isAnon   = from.toLowerCase().indexOf('anonimow') >= 0;

    if(!(isAnon || isInvite)) {
      if(!records[from]) {
        records[from] = [];
      }
      records[from].push({
        from: from,
        time: {
          source: time,
          unix: moment(time, 'DD.MM.YYYY HH:mm').valueOf()
        },
        href: href
      });
    }
  });

  localStorage.setItem('messages', JSON.stringify(records));

  if(!nextPage.get(0) || !nextPage.get(0).href) {
    localStorage.setItem('nkm-done', true);
    loadMessages();
  } else {
    document.location = nextPage.get(0).href;
  }


}

function loadMessages() {
  var messages = JSON.parse(localStorage.getItem('messages'));
  var promises = [];

  _.forEach(messages, function(sender, senderKey) {
    _.forEach(sender, function(m, messageIndex) {
      var promise = new Promise(function(resolve, reject) {
        $.get('http://nk.pl' + m.href, (function(key, i){
          return function(r) {
            var body = $(r);
            var text = body.find('.message_body').text();
            messages[key][i].text = text;
            resolve();
          }
        })(senderKey, messageIndex));
      });

      promises.push(promise);

    });
  });

  Promise.all(promises).then(function() {
    localStorage.setItem('messages', JSON.stringify(messages));
    debugger;
    alert('DONE!');
  })

}
