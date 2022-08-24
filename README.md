one-way-binding store
=====================

A minimal store for the frontend, that lets you listen to changes in values and update contents of DOM elements based on them. Persists to local storage.

## Index

- [Why?](#why)
- [How?](#how)
- [Reference](#reference)
- [Integrating in your website](#integrating-in-your-website)

## Why?

Frontend applications are heavy and bulky and take a long time to load. And yet, we've wrapped every aspect of web applications in them. I feel like that's the approach that should defend itself against such questions as "why?".

Okay, okay, I'll give you an example.

You have a header navigation on your site or web application. You want to show the user's username in the top right corner---a classic pattern, it makes sense!

Well, the modern approach would have you include the header in your frontend code. Perhaps it's React, perhaps it's Vue, no matter what it takes a long time to load on first visit, or to reload when the user decides that something is broken and hard refreshes the page: first, your massive JS bundle must be downloaded, then there's potentially requesting data from some server or other, and finally you get to render that little name in the header.

The faster some part of your site loads, the more likely the user is to feel that something is happening, something is actually loading (unlike loading up Facebook.com on a median consumer laptop two years ago, which took 14 seconds of real time loading, and I haven't tried since, so it's probably worse but I can't know for sure?). You get none of this benefit with everything packed in a single Javascript project.

Once upon a time, there was a pattern in use where a server would render content into a template before sending it back to the client. That would solve this issue! But today, everything is JAMstack, just JAM everywhere. And there are good reasons for this: statically built pages are easier to distribute on CDNs, and get fantastic scalability and perceived load times for users. But we've lost the ability to personalize every little page for each user visiting before sending it to them.

Now, there is (thank God!) a growing movement away from heavy JS frontends, and towards approaches that lean more into what the browser actually does well. Solving the problem of showing trivial text more effectively is a step towards supporting this approach better.

The hope is that this will help people build better user experiences with faster web applications with less data transfer over the internet. Lofty goals; this'll only make a tiny impact, I'm not deluding myself, don't worry.

## How?

The library is a tiny wrapper around localStorage in the browser. It allows for easy setting and getting of values, as well as setting up one-way bindings from the localStorage state to a DOM element.

Emphasis is on making the code as small in characters as possible (to an extent: it should still be maintainable), in order to encourage inlining the little script in the HTML files being served, making the code always available.

By inlining the little script in `<head>`, you get access to an object `window.owbs` (which can conveniently be accessed globally as `owbs`), which lets you set up these bindings.

Let's look at that pesky navigation header. Here's the offending bit of markup (look! someone just learned BEM!):

```html
<a class="header-nav__link" href="/profile">
  Profile <!-- How do I place a username here? -->
</a>
```

In order to bind the username to whatever we set with owbs, we just need to use `owbs.bind` (we don't even need a value in owbs or localstorage ahead of time). I'll use a data-value to target the link for data binding, because that separates concerns of styling and functionality, but you can use any CSS selector (anything that goes in `document.querySelector`, actually):

```html
<a class="header-nav__link" href="/profile" data-header-profile-link>
  Profile
</a>
<script>
  owbs.bind("username", "[data-header-profile-link]");
</script>
```

That's it! It fits neatly inline without causing any trouble. Now, the link text will be "Profile" unless there is some value for `username` in owbs, *or* until such a value is set (that's the "binding" part).

Let us be realistic and imagine that we still have a large and heavy JS application. Once it has loaded, perhaps we notice that the user is not logged in. So we prompt the user to log in. Once the user has logged in, we have some code setting up our local version of the user. That's where we need to add another little bit of code (here assuming that we got some `data` object with the user's username in `data.username`):

```js
owbs.val.username = data.username;
```

Hopla, and the text in the header profile link changes!

But not only that, the username is now saved in localStorage, so the next time the user visits the site, it will start with showing this username, until anything else is proven.

That also means you probably want to delete the value if the user logs out, and you can see how to do that and everything else below.

## Reference

The following is an extensive reference for the methods on `owbs`. You may also be interested in the small guide for integrating the code in your website, below.

### get `owbs.val[field]`

Used to get the current value of something in owbs. Instead of using the indexer syntax with square braces, you can just put in any field name. E.g. `owbs.val["username"]` and `owbs.val.username` are equivalent.

### set `owbs.val[field]`

Used to set some value in owbs. Indexer syntax isn't needed, so `owbs.val["username"] = "Karl"` and `owbs.val.username = "Karl"` are equivalent.

Once a value is set, this is the value you will get when you get `owbs.val[field]`. Additionally, setting a value updates all bindings and runs all change listeners.

** TODO: Right now only top-level values are watched for changes; should add support in future **

### `bind(field, target[, mapper[, setter]])`

This call registers a binding from some `field` in owbs to some DOM element described by a CSS selector passed into `target`. You can optionally pass the value through a `mapper` before setting it.

If you, for example, set up `owbs.bind("username", "[data-header-profile-link]")` and then set the username `owbs.val.username = "Karl"`, then the element described by `[data-header-profile-link]` will now have the text content `"Karl"`. Subsequent changes will happen, too.

If you need something slightly more specific in the text field, you can pass it through a mapper. For example, if we want to greet Karl, we can set up the following binding instead:

```js
owbs.bind("username", "[data-header-profile-link]", (username) => `Welcome back, ${username}`);
```

In the above example, the header profile link would the contain the text `"Welcome back, Karl"`.

The `setter` argument allows you to define what field is on the target element, and it supports the following values:

- `"text"` (default): set the `innerText` field
- `"html"`: set the `innerHTML` field
- `"attr:<attribute>"`: sets the attribute `<attribute>` to the value returned by the mapper. For example, `attr:data-hello` will set the `data-hello` attribute to the relevant value.
- A function `(element, value) => void`:  A custom setter that gets a target `element` and the relevant `value` to set. For example, `(element, value) => element.classList.add(value)` will add the value to the element's classList as a CSS class.

### register `on(field, listener)` change listener

You might want to hook in a bit more primitively, so you can! For example, you might want to synchronize the localStorage values with some state in your other Javascript code. You pass the key and a listener, and you can do whatever you want everytime the value changes:

```js
owbs.on("username", (value) => { /* idk, something, I guess? */ });
```

## Integrating in your website

**TODO: es5 (bigger) and modern web both available!**

### Easy start

The easiest way to test out the library is to include the distributable found at unpkg by inserting the following code in your HTML page:

```html
<script src="https://unpkg.com/owbs/dist/owbs.min.js"></script>
```

This hooks up the global variable owbs to be used as described above.

### Tighter integration

Using unpkg as a CDN for the file means downloading that code from a different server---and that is going to slow down execution of your page. You can't defer loading because the whole point of owbs is quickly rendering before other requests are required.

You want to somehow be able to place the owbs code directly in your generated HTML-files. In order to make it as versatile as possible, the library you can get on npm (`npm i owbs`) exposes a single method, `generate`, which gives you some nice and minified code.

This code somehow needs to find its way into your built HTML files, which varies a lot depending on which build system you are using.

With eleventy (a static site generator) it is as simple as adding a shortcode in `.eleventy.js`:

```js
// .eleventy.js
const owbs = require("owbs");

module.exports = function(eleventyConfig) {
    eleventyConfig.addShortcode("owbs", async function() {
        return await owbs.generate();
    });
};

//Note: this works for *some* templating languages, but e.g. not
//      handlebars that has no planned support for async shortcodes.
```

**TODO: an alternative generateSync could be used in the function to generate once, then serve same data every shortcode call**

Having added this shortcode, you will be able to use it in template files:

```html
<!-- template.liquid -->
<script>{% owbs %}</script>
```

```html
<!-- template.njk -->
<script>{% owbs %}</script>
```

```js
//template.11ty.js
module.exports = async function(data) {
    return `<script>${await this.owbs()}</script>`;
};
```

An alternative approach is calling `require("owbs").generate()` in a build step in order to generate an includeable file, that your other templates can then include. (Remember to not commit the generated code---add it to `.gitignore`.)
