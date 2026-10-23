document.querySelectorAll('tr[data-href]').forEach(row=>{
 row.addEventListener('click',event=>{if(event.target.closest('a')||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||window.getSelection()?.toString()) return;location.href=row.dataset.href;});
});
