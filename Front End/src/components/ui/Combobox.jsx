import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import './Combobox.css';

/** Searchable single-value choice field; accepts the existing <option> children. */
export default function Combobox({children,value,defaultValue='',onChange,id,name,required=false,disabled=false,className='',placeholder='Select an option',onBlur,onFocus,...rest}) {
  const uid=useId().replace(/:/g,'');
  const listId='aaa-options-'+uid;
  const controlId=id||'aaa-combo-'+uid;
  const root=useRef(null), input=useRef(null);
  const [internal,setInternal]=useState(defaultValue);
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [active,setActive]=useState(0);
  const selectedValue=value!==undefined?value:internal;
  const options=useMemo(()=>{
    const arr=[];
    const visit=(nodes)=>React.Children.forEach(nodes,child=>{
      if(!React.isValidElement(child))return;
      if(child.type==='option'){
        const label=React.Children.toArray(child.props.children).map(x=>typeof x==='string'||typeof x==='number'?String(x):'').join('').trim();
        const v=child.props.value!==undefined?child.props.value:label;
        arr.push({value:String(v??''),label:label||String(v??''),disabled:Boolean(child.props.disabled)});
      } else if(child.props.children){visit(child.props.children);}
    });
    visit(children);return arr;
  },[children]);
  const selected=options.find(o=>o.value===String(selectedValue??''));
  const filtered=options.filter(o=>o.label.toLowerCase().includes(query.toLowerCase())||o.value.toLowerCase().includes(query.toLowerCase()));
  useEffect(()=>{
    if(!open)return undefined;
    const close=e=>{if(!root.current?.contains(e.target)){setOpen(false);setQuery('');}};
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[open]);
  useEffect(()=>{setActive(0);},[query]);
  const choose=opt=>{
    if(!opt||opt.disabled)return;
    if(value===undefined)setInternal(opt.value);
    onChange?.({target:{value:opt.value,name,id:controlId,type:'select-one'},currentTarget:{value:opt.value,name,id:controlId}});
    setQuery('');setOpen(false);input.current?.focus();
  };
  const keydown=e=>{
    if(disabled)return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      if(!open){setQuery('');setOpen(true);setActive(0);}
      else{const d=e.key==='ArrowDown'?1:-1;setActive(i=>Math.max(0,Math.min(filtered.length-1,i+d)));}
    }else if(e.key==='Enter'&&open){e.preventDefault();choose(filtered[active]||filtered[0]);}
    else if(e.key==='Escape'){e.preventDefault();setOpen(false);setQuery('');}
    else if(e.key==='Tab'){setOpen(false);setQuery('');}
    else if(e.key==='Home'&&open){e.preventDefault();setActive(0);}
    else if(e.key==='End'&&open){e.preventDefault();setActive(Math.max(0,filtered.length-1));}
  };
  return (
    <div ref={root} className={'aaa-combobox'+(disabled?' aaa-combobox--disabled':'')}>
      {name && <input type="hidden" name={name} value={String(selectedValue??'')}/>}
      <div className={'aaa-combobox__field'+(open?' aaa-combobox__field--open':'')}>
        <input {...rest} ref={input} id={controlId} type="text" role="combobox" autoComplete="off"
          aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={open}
          aria-controls={listId} aria-activedescendant={open&&filtered[active]?listId+'-'+active:undefined}
          aria-label={rest['aria-label']||(id?undefined:placeholder)}
          className={'aaa-combobox__input '+className}
          value={open?query:(selected?.label??'')} placeholder={placeholder}
          required={required&&!selected} disabled={disabled}
          onFocus={e=>{if(!disabled){setOpen(true);setQuery('');setActive(0);}onFocus?.(e);}}
          onBlur={onBlur} onChange={e=>{setQuery(e.target.value);setOpen(true);}}
          onKeyDown={keydown}/>
        <button type="button" className="aaa-combobox__toggle" tabIndex={-1}
          aria-label={open?'Close options':'Show options'} aria-expanded={open}
          aria-controls={listId} disabled={disabled}
          onMouseDown={e=>e.preventDefault()}
          onClick={()=>{setOpen(v=>!v);setQuery('');setActive(0);input.current?.focus();}}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      {open&&!disabled&&<div className="aaa-combobox__list" id={listId} role="listbox" aria-label="Available options">
        {filtered.length?filtered.map((o,i)=><button key={o.value+'-'+i} id={listId+'-'+i}
          type="button" role="option" aria-selected={o.value===String(selectedValue??'')}
          disabled={o.disabled} className={'aaa-combobox__option'+(active===i?' aaa-combobox__option--active':'')}
          onMouseEnter={()=>setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(o)}>
          <span>{o.label}</span>{o.value===String(selectedValue??'')&&<span className="aaa-combobox__check" aria-hidden="true">✓</span>}
        </button>):<p role="status" className="aaa-combobox__empty">No matching options</p>}
      </div>}
    </div>
  );
}