// mdBook 內建的 highlight.js 沒有 vue，book.js 跑完後把這些區塊改用 xml（html）重新上色，
// <script> 裡會當 JavaScript、<style> 裡會當 CSS 上色
document.querySelectorAll("code.language-vue").forEach((block) => {
  block.classList.replace("language-vue", "language-xml");
  hljs.highlightBlock(block);
});
