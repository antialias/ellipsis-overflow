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
# Options
jQuery.fn.ellipsis takes an options object with the following properties:
 - `skip_slow_browsers`: defaults to `false`
 - `tolerance`: defaults to `1` maximum amount the element can scroll before triggering the truncation
 - `content`: defaults to `false`. if not supplied here, content will be scraped from the element itself using $.fn.html()
 - `ellipsis`: defaults to `&hellip` html-encoded string of what will be used for the ellipsis character at the end of the ellipsied content.
