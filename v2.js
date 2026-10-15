(() => {
  const editor=document.querySelector('#writing'),picker=document.querySelector('#photoFrame');
  const frames=['none','polaroid','rose','vintage','lace'];
  let selectedPhoto=null,editingLetter=null;
  const dialog=document.querySelector('#letterDialog'),form=document.querySelector('#letterForm');
  function changed(){editor.dispatchEvent(new Event('input',{bubbles:true}));}
  function clearSelection(){editor.querySelectorAll('img[data-selected]').forEach(img=>img.removeAttribute('data-selected'));selectedPhoto=null;}
  editor.addEventListener('click',event=>{
    if(event.target.tagName==='IMG'){
      clearSelection();selectedPhoto=event.target;selectedPhoto.setAttribute('data-selected','');
      const frame=frames.find(name=>selectedPhoto.classList.contains('photo-frame-'+name));picker.value=frame||'polaroid';
    }
    const edit=event.target.closest('.edit-letter');
    if(edit&&editor.contains(edit)){editingLetter=edit.closest('.memory-letter');openLetterDialog(editingLetter);}
  });
  picker.addEventListener('change',()=>{
    if(!frames.includes(picker.value))return;
    if(selectedPhoto&&editor.contains(selectedPhoto)){
      selectedPhoto.className='photo-frame-'+picker.value;changed();
    }
  });
  function openLetterDialog(letter){
    form.elements.letterTitle.value=letter?.querySelector('summary')?.textContent||'Uma carta para guardar';
    form.elements.letterText.value=letter?.querySelector('.letter-body')?.textContent||'';
    dialog.showModal();form.elements.letterText.focus();
  }
  document.querySelector('#addLetter').onclick=()=>{editingLetter=null;openLetterDialog();};
  document.querySelector('#cancelLetter').onclick=()=>dialog.close();
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const letter=document.createElement('details');letter.className='memory-letter';letter.setAttribute('contenteditable','false');
    const summary=document.createElement('summary');summary.textContent=form.elements.letterTitle.value.trim()||'Uma carta para guardar';
    const body=document.createElement('div');body.className='letter-body';body.textContent=form.elements.letterText.value;
    const edit=document.createElement('button');edit.className='edit-letter';edit.type='button';edit.textContent='Editar carta';
    letter.append(summary,body,edit);
    if(editingLetter&&editor.contains(editingLetter))editingLetter.replaceWith(letter);
    else{editor.append(letter,document.createElement('br'));}
    dialog.close();editingLetter=null;changed();
  });
  // Hover é complementar: summary continua funcionando por clique, toque e teclado.
  editor.addEventListener('pointerover',event=>{
    const letter=event.target.closest('.memory-letter');
    if(letter&&event.pointerType==='mouse'&&!letter.contains(event.relatedTarget)){
      if(!letter.open){letter.open=true;letter.dataset.hoverOpened='true';}
    }
  });
  editor.addEventListener('pointerout',event=>{
    const letter=event.target.closest('.memory-letter');
    if(letter&&!letter.contains(event.relatedTarget)&&letter.dataset.hoverOpened){
      if(!letter.contains(document.activeElement))letter.open=false;
      delete letter.dataset.hoverOpened;
    }
  });
  // Nunca grava estado de hover/seleção ou envelope aberto nas memórias.
  window.biaPrepareContent=()=>{
    const copy=editor.cloneNode(true);
    copy.querySelectorAll('details').forEach(node=>node.removeAttribute('open'));
    copy.querySelectorAll('[data-selected],[data-hover-opened]').forEach(node=>{node.removeAttribute('data-selected');node.removeAttribute('data-hover-opened');});
    return copy.innerHTML;
  };
})();
