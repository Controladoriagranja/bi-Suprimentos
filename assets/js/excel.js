"use strict";
// XLSX local: textos são células literais; nenhum dado sai para outro serviço.
window.SuprimentosExcel=(()=>{
 const encode=new TextEncoder(),xml=v=>String(v??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 const crc=bytes=>{let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0;};
 function zip(files){
  const chunks=[],directory=[];let offset=0,size=0;
  const header=(length,values)=>{const bytes=new Uint8Array(length),view=new DataView(bytes.buffer);for(const[at,value,width]of values)width===2?view.setUint16(at,value,true):view.setUint32(at,value,true);return bytes;};
  for(const[path,content]of files){
   const name=encode.encode(path),bytes=encode.encode(content),checksum=crc(bytes);
   const local=header(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[12,33,2],[14,checksum,4],[18,bytes.length,4],[22,bytes.length,4],[26,name.length,2]]);
   const central=header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[14,33,2],[16,checksum,4],[20,bytes.length,4],[24,bytes.length,4],[28,name.length,2],[42,offset,4]]);
   chunks.push(local,name,bytes);directory.push(central,name);offset+=local.length+name.length+bytes.length;size+=central.length+name.length;
  }
  return new Blob([...chunks,...directory,header(22,[[0,0x06054b50,4],[8,files.length,2],[10,files.length,2],[12,size,4],[16,offset,4]])],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 }
 const column=index=>{let name='';for(index++;index;index=Math.floor((index-1)/26))name=String.fromCharCode(65+(index-1)%26)+name;return name;};
 function create(columns,rows,name='Relatório'){
  if(rows.length>1048575)throw new Error('A tabela excede o limite de linhas do Excel. Refine os filtros.');
  const textCell=(value,ref,style=0)=>'<c r="'+ref+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+xml(value)+'</t></is></c>';
  const cell=(value,type,ref)=>{
   if(value==null||value==='')return '<c r="'+ref+'"/>';
   if(['money','percent','number','days','int'].includes(type)&&Number.isFinite(Number(value))){const style=type==='money'?2:type==='percent'?3:type==='number'?4:1;return '<c r="'+ref+'" s="'+style+'"><v>'+(type==='days'?Math.round(Number(value)):Number(value))+'</v></c>';}
   if(type==='date'){const day=Date.parse(String(value).slice(0,10)+'T00:00:00Z');if(Number.isFinite(day))return '<c r="'+ref+'" s="5"><v>'+(day/86400000+25569)+'</v></c>';}
   return textCell(value,ref);
  };
  const last=column(columns.length-1)+(rows.length+1),sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:'+last+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>'+columns.map((c,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+(['text','fornecedor','comprador','item'].includes(c.tipo)?42:22)+'" customWidth="1"/>').join('')+'</cols><sheetData><row r="1">'+columns.map((c,i)=>textCell(c.nome,column(i)+'1',6)).join('')+'</row>'+rows.map((r,i)=>'<row r="'+(i+2)+'">'+columns.map((c,j)=>cell(r[c.codigo],c.tipo,column(j)+(i+2))).join('')+'</row>').join('')+'</sheetData><autoFilter ref="A1:'+last+'"/></worksheet>';
  const ns='http://schemas.openxmlformats.org/package/2006/relationships',rel='http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
  return zip([
   ['[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
   ['_rels/.rels','<Relationships xmlns="'+ns+'"><Relationship Id="rId1" Type="'+rel+'officeDocument" Target="xl/workbook.xml"/></Relationships>'],
   ['xl/workbook.xml','<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="'+xml(name.replace(/[\\/?*\[\]:]/g,' ').slice(0,31))+'" sheetId="1" r:id="rId1"/></sheets></workbook>'],
   ['xl/_rels/workbook.xml.rels','<Relationships xmlns="'+ns+'"><Relationship Id="rId1" Type="'+rel+'worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="'+rel+'styles" Target="styles.xml"/></Relationships>'],
   ['xl/styles.xml','<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;R$&quot; #,##0.00"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF70252C"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7">'+[0,1,164,10,4,165].map(n=>'<xf numFmtId="'+n+'" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>').join('')+'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
   ['xl/worksheets/sheet1.xml',sheet]
  ]);
 }
 function download(columns,rows,name){const url=URL.createObjectURL(create(columns,rows,name)),link=document.createElement('a');link.href=url;link.download=name+'.xlsx';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return {create,download};
})();
