# Description
jQuery.fn.ellipsis is a jQuery plugin that truncates the content selected overflow-y:scroll elements with an ellipsis character such that they no longer need to scroll. It's a cross-browser, multi-line alternative to `text-overflow: ellipsis`.

# How it works
jQuery.fn.ellipsis will truncate content from any element that scrolls due to overflow such that it will no longer scroll. There is no built-in browser function that will give the correct content length of an element to prevent overflow, so the optimal length is determined using a binary search algorithm. Once the maximum length without overflow is determined, the ellipsis string is appended. The ellipsis string may cause the content to overflow, so the content is then reduced word by word until the content no longer overflows.

jQuery.fn.ellipsis does most of its work asynchronously to allow for other potentially more noticeable things to happen on your page before the content is truncated, since it's likely that only a few words will be truncated from each element. It returns a jQuery deferred object so you can run code after the truncation has taken place.

# Requirements
jQuery 1.5 or later
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
Call jquery.fn.ellipsis on the jQuery collection of elements that you want to ellipsis:
```javascript
jQuery(".to-ellipsis").ellipsis();
```
# Limitations
Truncated content can only consist of text nodes.
# Return value
jquery.fn.ellipsis returns a jQuery deferred object that is resolved when all selected elements have been truncated. Attach a done handlers to the deferred object if you want to run code after it is finished.
#### example:
```javascript
jQuery(".to-ellipsis").ellipsis().done(function () {
  console.log("all content has been truncated");
})
```
# Options
jQuery.fn.ellipsis takes an optional options object with the following properties:
 - `skip_slow_browsers`: defaults to `false`
 - `tolerance`: defaults to `1` maximum amount the element can scroll before triggering the truncation
 - `content`: defaults to `false`. if not supplied here, content will be scraped from the element itself using `$.fn.html()`
 - `ellipsis`: defaults to `&hellip;` html-encoded string of what will be used for the ellipsis character at the end of the ellipsied content.

#### example:
```javascript
jQuery(".to-ellipsis").ellipsis({ellipsis: "...."}); // use a string of four periods instead of …
```
