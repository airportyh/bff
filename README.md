Browserify Friend
======================

Browserify Friend (BFF) - it is as if browserify was built into the browser.

## Install

    npm install bff -g

## Development Server

In a directory run:

    > bff server
    Serving contents on port 3000.

This will start a static file web server on port 3000 except that Javascript files will automatically get browserified.

## Build the Site

In the same directory run:

    > bff build
    Successfully browserified your site in 'build'.

Now your site has been browserified within the `build` directory and it can be served by a static web server.

## Example

To try this out, start in a new empty directory. Let's install `domify` a library to convert an html string into a DOM element

    npm install domify

make an `index.html` file with just this

    <body>
      <script src="index.js"></script>
    </body>

Make an `index.js`

    var domify = require('domify')
    document.body.appendChild(domify('<h1>Hello World with Browserify!</h1>'))

Start the bff server

    bff server

Navigate to `http://localhost:3000` and see it work.




