<script lang="ts">
  import { getFrameHtml, type Frame, type GetFrameHtmlOptions } from 'frames.js';

  let frame: Frame = {
    version: '1-0-0',
    image: `https://placehold.co/191x100`,
  };

  const options: GetFrameHtmlOptions = {
    /** value for the OG "og:title" html tag*/
    og: { title: 'frames.lol' },
    /** the <title> of the page */
    title: 'frames.lol',
    /** Additional string to include in the <body> of the html string */
    htmlBody: 'Body',
    /** Additional string to include in the <head> of the html string */
    htmlHead: 'Head',
  };
  const html = getFrameHtml(frame, options);
  console.log(html);
</script>
