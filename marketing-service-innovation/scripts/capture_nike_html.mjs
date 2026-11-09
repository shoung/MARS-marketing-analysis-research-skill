const fs=await import('node:fs/promises');
// Set both fields before running through `ego-browser nodejs`. Reuse one active task space.
const config={skillDirectory:'/absolute/path/to/marketing-service-innovation',taskSpaceId:null,staged:false};
if(!Number.isInteger(config.taskSpaceId)||!config.skillDirectory.startsWith('/')||config.skillDirectory.startsWith('/absolute/'))throw new Error('Set config.skillDirectory and the active config.taskSpaceId before running.');
const skill=config.skillDirectory;
const base=skill+'/internal/nike-case/previews/html';
const internal=skill+'/internal/nike-case';
const task=await taskSpace(config.taskSpaceId),page=task.page('p1');
const modes=[{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844},{name:'tablet',width:768,height:1024},{name:'zoom200-reflow',width:720,height:450,deviceScaleFactor:2}];
await fs.mkdir(base,{recursive:true});
const report=[];
for(const mode of modes){
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:mode.width,height:mode.height,deviceScaleFactor:mode.deviceScaleFactor||1,mobile:false});
 await page.evaluate(()=>window.scrollTo(0,0));
 const facts=await page.evaluate(()=>({width:innerWidth,height:innerHeight,devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,pageHeight:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,scrollableTables:[...document.querySelectorAll('.table-scroll')].filter(x=>x.scrollWidth>x.clientWidth).length}));
 const captures=[];
 if(mode.name==='mobile'){
  const tableSelector=await page.evaluate(()=>{
   const tables=[...document.querySelectorAll('[aria-labelledby="step-5"] .table-scroll')];
   const table=tables.find(node=>node.scrollWidth>node.clientWidth);
   return table?'#'+table.id:null;
  });
  if(tableSelector){
  await page.focus(tableSelector);
  await page.keyboard.press('End');
  facts.keyboardHorizontalScroll=await page.evaluate(selector=>{
   const table=document.querySelector(selector);
   return {left:table.scrollLeft,max:table.scrollWidth-table.clientWidth,focus:document.activeElement===table,visibleOutline:getComputedStyle(table).outlineStyle};
  },tableSelector);
  const file=base+'/mobile-blueprint-end.png';
  await page.screenshot({path:file});captures.push({file,id:'blueprint-right-edge',y:await page.evaluate(()=>scrollY)});
  await page.keyboard.press('Home');
  }
 }
 if(mode.name==='desktop'){
  for(let y=0,n=1;y<facts.pageHeight;y+=820,n++){
   await page.evaluate(y=>window.scrollTo(0,y),y);
   const file=`${base}/desktop-${String(n).padStart(2,'0')}.png`;
   await page.screenshot({path:file});captures.push({file,y:await page.evaluate(()=>scrollY)});
  }
 }else{
  for(const id of ['top','main','step-1','step-2','step-3','step-4','step-5','step-6','review','kotler','parasuraman','sources','source-1']){
   await page.evaluate(id=>document.getElementById(id).scrollIntoView(),id);
   const file=`${base}/${mode.name}-${id}.png`;
   await page.screenshot({path:file});captures.push({file,id,y:await page.evaluate(()=>scrollY)});
  }
 }
 report.push({mode,facts,captures});console.log(mode.name,facts,captures.length);
}
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await page.evaluate(()=>window.scrollTo(0,0));
await fs.writeFile(internal+'/responsive-captures.json',JSON.stringify({date:new Date().toISOString(),spaceId:config.taskSpaceId,page:'p1',note:'720x450 CSS viewport at DPR2 gives the 200% reflow equivalent of a 1440x900 viewport.',modes:report},null,2));
