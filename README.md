# Description
Use `ellipsis-overflow` to truncate the content of elements with overflow-y:scroll specified in their style with an ellipsis character such that they no longer need to scroll. It's a cross-browser, multi-line alternative to `text-overflow: ellipsis`.

# How it works
`ellipsis-overflow` will truncate content from any element that scrolls due to overflow such that it will no longer scroll. There is no built-in browser function that will give the correct content length of an element to prevent overflow, so the optimal length is determined using a binary search algorithm. Once the maximum length without overflow is determined, the ellipsis string is appended. The ellipsis string may cause the content to overflow, so the content is then reduced word by word until the content no longer overflows.

# Usage
#### Set the style of the element that you will be ellipsing:
```css
.to-ellipsis {
  display: inline-block;
  height: 20px;
  overflow-y: scroll; /* setting overflow:scroll is required because
                         the content length is cut-off based on when
                         the browser decides the element is scrollable */
}
```
Pass it an element and an optional config map and the element will be automatically ellipsed:
```javascript
var ellipsis = require('ellipsis-overflow');
ellipsis(el)
```
# Limitations
Truncated content can only consist of text nodes.
# Options
`ellipsis-overflow` takes an optional options object with the following properties:
 - `skip_slow_browsers`: defaults to `false`
 - `tolerance`: defaults to `1` maximum amount the element can scroll before triggering the truncation
 - `content`: defaults to `false`. if not supplied here, content will be scraped from the element itself using `Element.prototype.innerHTML`
 - `ellipsis`: defaults to `&hellip;` html-encoded string of what will be used for the ellipsis character at the end of the ellipsied content.

#### example:
```javascript
ellipsis(el, {ellipsis: "...."}); // use a string of four periods instead of …
```
