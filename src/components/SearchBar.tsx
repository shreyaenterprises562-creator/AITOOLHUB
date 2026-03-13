import { useState } from "react"
import { Search } from "lucide-react"
import { AI_TOOLS } from "../data"

export default function SearchBar({ value, onChange }: any) {

const [suggestions, setSuggestions] = useState<any[]>([])

function handleChange(e: any) {

const query = e.target.value
onChange(query)

if(query.length === 0){
setSuggestions([])
return
}

const results = AI_TOOLS.filter(tool =>
tool.name.toLowerCase().includes(query.toLowerCase())
).slice(0,5)

setSuggestions(results)

}

return (

<div className="relative">

<div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

<Search size={20} className="text-slate-400 mr-2"/>

<input
type="text"
value={value}
onChange={handleChange}
placeholder="Search AI tools..."
className="w-full outline-none"
/>

</div>

{suggestions.length > 0 && (

<div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">

{suggestions.map(tool => (

<div
key={tool.name}
className="cursor-pointer px-4 py-3 hover:bg-slate-100"
onClick={()=>{
onChange(tool.name)
setSuggestions([])
}}
>

{tool.name}

</div>

))}

</div>

)}

</div>

)

}