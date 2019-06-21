const BG_LIST = [
    "assets/bg1.jpg",
    "assets/bg2.png",
    "assets/bg3.png",
    "assets/bg4.png",
    "assets/bg5.png",
    "assets/bg6.png",
    "assets/bg7.png",
    "assets/bg8.png",
];
const NAME = "Daniel";
const WELCOME_MESSAGE_TEMPLATE = ["night", "morning", "afternoon", "evening"];
const SHORTCUT_MAP = {
    "github.com": "assets/github.png",
    "www.reddit.com": "assets/reddit.png",
    "www.youtube.com": "assets/youtube.png",
    "mail.google.com": "assets/gmail.png",
};
const HOST_MAP = {
    "www.reddit.com": "Reddit",
    "dev.to": "Dev.to",
    "xkcd.com": "xkcd",
    "testandcode.com": "Test & Code",
    "realpython.com": "Real Python",
    "jeffknupp.com": "Jeff Knupp's Blog",
};
const FEED_LIST = [
    "https://jeffknupp.com/atom.xml",
    // "https://dev.to/feed/tag/python",
    "https://feeds.fireside.fm/testandcode/rss",
    "https://realpython.com/atom.xml?format=xml",
    "https://xkcd.com/rss.xml",
];
const MAX_FEED_NUM = 30;

function setup_bg() {
    let random_index = Math.floor(Math.random() * 8);
    document.body.style.backgroundImage = "url('" + BG_LIST[random_index] + "')";
}

function setup_message() {
    let curHours = new Date().getHours();
    curHours = Math.floor(curHours/6); // Simply dividing current hours by 6 proves to be a good enough aproximation.
    if (curHours == 4) curHours = 3;
    let welcome = "Good " + WELCOME_MESSAGE_TEMPLATE[curHours] + ", " + NAME;
    document.getElementById("welcome-string").innerHTML = welcome;
}

function setup_groups() {
    let $container = document.getElementById("content");

    for (var key in SHORTCUT_MAP){
        let value = SHORTCUT_MAP[key];

        let group = document.createElement("div");
        group.className = "group";
        $container.appendChild(group);

        let link = document.createElement("a");
        link.setAttribute("href", "https://" + key);
        group.appendChild(link);

        let image = document.createElement("img");
        image.setAttribute("src", value);
        link.appendChild(image)
    }
}

function get_hostname(url) {
    return new URL(url).hostname;
}

class FeedItem {
    constructor(title, link, date) {
        this.title = title;
        this.link = link;
        this.mseconds = date.getTime();

        let hostname = HOST_MAP[get_hostname(link)];
        let elapsed = Math.trunc((Date.now() - this.mseconds) / 1000 / 60 / 60);
        this.summary = hostname + " - ";
        if (elapsed == 0) {
            this.summary += "less than an hour ago";
        } else {
            this.summary += elapsed + " hours ago";
        }
    }
}

function feed_add(title, description, url) {
    let feed = document.getElementById("feed_list");
    
    let link_elem = document.createElement("a");
    link_elem.setAttribute("href", url);
    feed.appendChild(link_elem);

    let title_elem = document.createElement("p");
    title_elem.setAttribute("class", "title");
    title_elem.innerHTML = title;
    link_elem.appendChild(title_elem);

    let desc_elem = document.createElement("p");
    desc_elem.setAttribute("class", "summary");
    link_elem.appendChild(desc_elem);

    let url_favicon = document.createElement("img");
    let hostname = get_hostname(url);
    url_favicon.setAttribute("src", "https://s2.googleusercontent.com/s2/favicons?domain=" + hostname);
    url_favicon.setAttribute("class", "feed_favicon");

    desc_elem.appendChild(url_favicon);
    desc_elem.innerHTML += " ";
    desc_elem.innerHTML += description;
}

async function feed_mix() {
    let mixed_feeds = [];
    let promise_list = [];
    for (let i in FEED_LIST) {
        let feed_url = FEED_LIST[i];
        promise_list.push(feednami.load(feed_url));
    }
    let feed_list = await Promise.all(promise_list.map(p => p.catch(error => null)));
    for (let i in feed_list) {
        let feed = feed_list[i];
        if (feed == null) {continue;}
        // console.log(feed);
        for (let entry of feed.entries) {
            let feed_item = new FeedItem(entry.title, entry.link, new Date(entry.date));
            mixed_feeds.push(feed_item);
        }
    }
    mixed_feeds.sort(function(a, b){
        return b.mseconds - a.mseconds;
    })
    return mixed_feeds;
}

function setup_feed() {
    feed_mix().then(mixed_feeds => {
        for (let i in mixed_feeds.slice(0, MAX_FEED_NUM)) {
            let item = mixed_feeds[i];
            feed_add(item.title, item.summary, item.link);
        }
    })
}

function main(){
    setup_bg();
    setup_message();
    setup_groups();
    setup_feed();
}

$(function(){
	$('#feed_list').slimScroll({
        width: '25vw',
        height: '45vh',
        color: '#ffffff',
	});
});

main();
