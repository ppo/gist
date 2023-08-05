// Turn off "Topic Suggestions" and "Interests" at Twitter.
//
// USAGE: https://twitter.com/settings/your_twitter_data/twitter_interests › Bookmarklet
//
// Source: https://www.neowin.net/guides/turn-off-topic-suggestions-and-interests-at-twitter-with-this-handy-script/


u = 'https://twitter.com/settings/your_twitter_data/twitter_interests';
if (window.location.href != u) navigation.navigate(u);
timer = 1000;
items = document.querySelectorAll('div > input[type="checkbox"]:checked');
if (items.length == 0) alert('🤷‍♂️ All interests already disabled.');
items.forEach((interest, i) => {
  setTimeout(function() {
    ii = i + 1;
    console.log('Disabling interest ' + ii + '/' + items.length);
    interest.click();
    interest.scrollIntoView();
    if (ii == items.length) alert('👍 All interests have been disabled.');
  }, timer);
  timer += 2000;
});
