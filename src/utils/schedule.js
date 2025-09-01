// src/utils/schedule.js
export const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun']
export const DAY_LABELS = {
  mon:'Lunes', tue:'Martes', wed:'Miércoles',
  thu:'Jueves', fri:'Viernes', sat:'Sábado', sun:'Domingo'
}

export function makeEmptySchedule(){
  return { timezone:'', days:Object.fromEntries(DAY_KEYS.map(k=>[k,[]])), exceptions:[] }
}

const pad = n => n.toString().padStart(2,'0')
export const fmtTime = t => (!t ? '--:--' : t)
export const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`

function toMins(hhmm){ if(!hhmm) return NaN; const [h,m]=hhmm.split(':').map(Number); return h*60+m }
function dowKey(date){ return ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()] }
function intervalsFor(schedule, date){
  const dayStr = fmtDate(date)
  const ex = (schedule?.exceptions||[]).find(e=>e.date===dayStr)
  if (ex) return ex.intervals||[]
  return schedule?.days?.[dowKey(date)] || []
}

export function isOpenNow(schedule, now=new Date()){
  const m = now.getHours()*60 + now.getMinutes()
  return intervalsFor(schedule, now).some(iv=>{
    const a=toMins(iv.open), b=toMins(iv.close)
    return Number.isFinite(a)&&Number.isFinite(b)&&a<b&&m>=a&&m<b
  })
}

export function nextChange(schedule, now=new Date()){
  const open = isOpenNow(schedule, now)
  const mnow = now.getHours()*60 + now.getMinutes()
  for (let d=0; d<8; d++){
    const ref = new Date(now); ref.setDate(now.getDate()+d)
    const ivals = intervalsFor(schedule, ref).slice().sort((x,y)=>toMins(x.open)-toMins(y.open))
    if (open && d===0){
      for (const iv of ivals){
        const a=toMins(iv.open), b=toMins(iv.close)
        if (mnow>=a && mnow<b) return { type:'close', at:new Date(ref.getFullYear(),ref.getMonth(),ref.getDate(),Math.floor(b/60), b%60) }
      }
    } else {
      for (const iv of ivals){
        const a=toMins(iv.open)
        if (d>0 || a>mnow) return { type:'open', at:new Date(ref.getFullYear(),ref.getMonth(),ref.getDate(),Math.floor(a/60), a%60) }
      }
    }
  }
  return null
}

export function dayIntervalsLabel(schedule, key){
  const today = new Date()
  const mapIndex = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 }
  const base = new Date(today)
  base.setDate(today.getDate()+((mapIndex[key]-today.getDay()+7)%7))
  const ivals = intervalsFor(schedule, base)
  if (!ivals.length) return 'Cerrado'
  return ivals.map(iv => `${iv.open}–${iv.close}`).join(', ')
}
