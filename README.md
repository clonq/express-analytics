express-analytics
===

Simple analytics middleware for express

How it works
---
express-analytics middleware intercepts every http request, extracts analytics from the user-agent header and fires analytics events and customer lifecycle events.

Example
---
```
var express = require('express');
var xa = require('express-analytics');

var app = express();
...
app.use(xa());
...
```
This will fire events like `xa:firefox`, `xa:desktop`, `xa:windows` with associated data. Your app can listen to these events and do additional processing or simply store them for offline reporting.

Your app would log xa events as simple as:
```
process.on('xa:firefox', function(data){
    console.log(data)
})
```
which will output something similar to this:
```
{ key: 'firefox',
  date: Wed Dec 15 2013 21:15:58 GMT-0500 (Eastern Standard Time),
  count: 21 }
```

Advanced Use
---
Let's say you want to track your customers' lifecycle instead of basic analytics. You would probably look for events like acquisition, activation, retention and so on.

With express-analytics you can achieve that by defining mappings from the simple analytics events space to the customer lifecycle space. Here is a slightly modified version of the initial example:
```
var express = require('express');
var xa = require('express-analytics');
var clm = require('./customerLifecycleMappings.json');

var app = express();
...
app.use(xa({customerLifecycle:clm}));
...
```
Your `customerLifecycleMappings.json` could look something like this:
```
[
  {
    "if":[{"path":"/"}, {"bot":false}], "then": {"tag":"acquisition", "score":1}
  }
]
```
This mapping can be read as "If there is a request for my home page that is not coming from a web crawler then consider it an acquisition event".

If in your app you log acquisition events:
```
process.on('xa:acquisition', function(data){
    console.log(data)
})
```
You should see something like this in your console:
```
{ key: 'acquisition',
  date: Wed Dec 16 2013 18:42:36 GMT-0500 (Eastern Standard Time),
  count: 1,
  firefox: true,
  desktop: true,
  windows: true,
  browser: 'Firefox 26.0',
  os: 'Windows 7',
  score: 1 }
```
You can expand your mappings to include other events:
```
[
    { "if":[{"path":"/"}, {"bot":true}], "then": {"tag":"awareness", "score":0.1} },
    { "if":[{"path":"/"}, {"bot":false}], "then": {"tag":"acquisition", "score":1} },
    { "if":[{"path":"/signup"}, {"bot":false}], "then": {"tag":"activation", "score":1} },
    { "if":[{"path":"/signin"}, {"bot":false}], "then": {"tag":"retention", "score":0.33} }
]
```

Session Tracker
---
Let's say you want to track customer behaviour for a specific customer. Assuming that your users need to login and that you store their UID in session, you can use express-analytics to track user behaviour by listening to specific `xa:` events.

But let's look at the configuration first. In order to track session events you obviously need to enable express session middleware:
```
...
app.use(express.cookieParser());
app.use(express.session({secret:'sekr3t'}));
...
```
Also, you have to tell express-analytics what session keys should track:
```
var xaoptions = {
    customerLifecycle: require('./customerLifecycleMappings.json'),
    sessionSpy: ['uid']
}
...
app.use(xa(xaoptions));
```
Here we ask express-analytics middleware to track uid session key.

**Important**: make sure the line
```
app.use(xa)
```
comes before:
```
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
```
Now, every request made while the session has a key uid will fire an event `xa:uid:[uid-value]`. For example:
```
process.on('xa:uid:123', function(data){
    console.log(data)
})
```
will show something similar to:
```
{ key: 'uid:123',
  date: Thu Dec 19 2013 16:52:15 GMT-0500 (Eastern Standard Time),
  count: 4,
  firefox: true,
  desktop: true,
  windows: true,
  browser: 'Firefox 26.0',
  os: 'Windows 7',
  path: '/report' }
```
every time the user with uid = 123 makes a /report request.

To be continued...
