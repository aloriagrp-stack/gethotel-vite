with open('gethotel-next/src/pages-legacy/HotelDetailContent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old1 = '''                                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 rounded-2xl">
                                            {["3", "6", "12"].map(h => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => {
                                                        setTempDuration(h);
                                                        const p = new URLSearchParams(window.location.search);
                                                        p.set("duration", h);
                                                        setSearchParams(p);
                                                    }}
                                                    className={cn(
                                                        "py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer",
                                                        duration === h 
                                                            ? "bg-white text-slate-950 shadow-xs font-black" 
                                                            : "text-slate-600 hover:text-slate-900"
                                                    )}
                                                >
                                                    {h} Hours
                                                </button>
                                            ))}
                                        </div>'''

new1 = '''                                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 rounded-2xl">
                                            {["3", "6", "12"].map(h => {
                                                const isAvail = ((hotel as any)?.availableSlots || ["3", "6", "12"]).includes(h);
                                                return (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        disabled={!isAvail}
                                                        title={!isAvail ? `This property does not offer ${h} hours stay` : `${h} Hours`}
                                                        onClick={() => {
                                                            if (!isAvail) return;
                                                            setTempDuration(h);
                                                            const p = new URLSearchParams(window.location.search);
                                                            p.set("duration", h);
                                                            setSearchParams(p);
                                                        }}
                                                        className={cn(
                                                            "py-2.5 rounded-xl text-xs font-bold transition-all text-center",
                                                            !isAvail 
                                                                ? "opacity-35 text-slate-400 line-through cursor-not-allowed select-none"
                                                                : duration === h 
                                                                    ? "bg-white text-slate-950 shadow-xs font-black cursor-pointer" 
                                                                    : "text-slate-600 hover:text-slate-900 cursor-pointer"
                                                        )}
                                                    >
                                                        {h} Hours{!isAvail ? " (N/A)" : ""}
                                                    </button>
                                                );
                                            })}
                                        </div>'''

old2 = '''                                            <div className="grid grid-cols-3 gap-2">
                                                {[3, 6, 12].map(h => (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        onClick={() => {
                                                            setTempDuration(String(h));
                                                            const params = new URLSearchParams(window.location.search);
                                                            params.set("duration", String(h));
                                                            setSearchParams(params);
                                                        }}
                                                        className={cn(
                                                            "py-2.5 rounded-xl font-black text-xs transition-all border cursor-pointer",
                                                            Number(tempDuration) === h ? "bg-brand-600 text-white border-brand-600 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {h} Hours Stay
                                                    </button>
                                                ))}
                                            </div>'''

new2 = '''                                            <div className="grid grid-cols-3 gap-2">
                                                {[3, 6, 12].map(h => {
                                                    const isAvail = ((hotel as any)?.availableSlots || ["3", "6", "12"]).includes(String(h));
                                                    return (
                                                        <button
                                                            key={h}
                                                            type="button"
                                                            disabled={!isAvail}
                                                            title={!isAvail ? `This property does not offer ${h} hours stay` : `${h} Hours Stay`}
                                                            onClick={() => {
                                                                if (!isAvail) return;
                                                                setTempDuration(String(h));
                                                                const params = new URLSearchParams(window.location.search);
                                                                params.set("duration", String(h));
                                                                setSearchParams(params);
                                                            }}
                                                            className={cn(
                                                                "py-2.5 rounded-xl font-black text-xs transition-all border",
                                                                !isAvail
                                                                    ? "opacity-35 bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed select-none"
                                                                    : Number(tempDuration) === h 
                                                                        ? "bg-brand-600 text-white border-brand-600 shadow-md cursor-pointer" 
                                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                            )}
                                                        >
                                                            {h} Hours Stay{!isAvail ? " (N/A)" : ""}
                                                        </button>
                                                    );
                                                })}
                                            </div>'''

content = content.replace('\r\n', '\n')
old1_norm = old1.replace('\r\n', '\n')
new1_norm = new1.replace('\r\n', '\n')
old2_norm = old2.replace('\r\n', '\n')
new2_norm = new2.replace('\r\n', '\n')

assert old1_norm in content, 'old1 not found'
assert old2_norm in content, 'old2 not found'

content = content.replace(old1_norm, new1_norm).replace(old2_norm, new2_norm)

with open('gethotel-next/src/pages-legacy/HotelDetailContent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated both duration selectors in HotelDetailContent.tsx!')
