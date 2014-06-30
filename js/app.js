var $          = require('jquery'),
    _          = require('lodash'),
    FeedParser = require('feedparser'),
    http       = require('http'),
    gui        = window.require('nw.gui');

var container       = $('.container'),
    articleRow      = '<div class="item" data-url="<%= url %>" data-datetime="<%= datetime %>"><h2><%= title %></h2><div class="source"><%= source %></div></div>',
    lastBuildDate   = '',
    updated;

function App(feedUrl, refreshInterval) {
    if (!feedUrl) {
        console.error('Specify a feed URL.');
        return;
    }

    _.extend(this, {
        feedUrl: feedUrl,
        refreshInterval: refreshInterval || 30
    });

    this.init();
}

_.extend(App.prototype, {
    init: function() {
        // Initial feed load
        this.loadVGFeed();

        // Set interval to get updated feed date
        setInterval(_.bind(this.loadVGFeed, this), this.refreshInterval * 1000);
    },
    rowClickHandler: function() {
        // Open URL with default browser.
        gui.Shell.openExternal($(this).data('url'));
    },
    loadVGFeed: function() {
        var rowClickHandler = this.rowClickHandler;

        http.get(this.feedUrl, function(resource) {
            resource
                .pipe(new FeedParser())
                .on('meta', function (meta) {
                    var buildDate = meta['rss:lastbuilddate']['#'];

                    updated = buildDate > lastBuildDate;
                    lastBuildDate = buildDate;

                    if (updated) {
                        container.empty();
                    }
                })
                .on('readable', function() {
                    if (!updated) {
                        return;
                    }

                    var stream = this, item;
                    while (item = stream.read()) {
                        var newRow = $(_.template(articleRow, {
                            url: item.link,
                            title: item.title,
                            datetime: item.pubDate,
                            source: item.link.replace(/^http[s]?:\/\//, '')
                        }));

                        // Bind click event to make something happen
                        newRow.on('click', rowClickHandler);

                        // Append the new row to the container
                        newRow.appendTo(container);
                    }
                });
        });
    }
});

module.exports = App;