import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { 
  Calculator, Settings as SettingsIcon, ShoppingCart, Users, BarChart2, 
  Edit2, Edit, PlusCircle, ArrowLeft, Clock, CheckCircle, X, Trash2, 
  ArrowRightLeft, Equal, ChevronDown, ChevronUp, AlertTriangle 
} from 'lucide-react';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const triggerHaptic = (type = 'click', enabled = true) => {
    if (!enabled || !navigator.vibrate) return;
    if (type === 'tick') navigator.vibrate(5);
    else if (type === 'pop') navigator.vibrate([15, 30, 15]);
    else if (type === 'success') navigator.vibrate([20, 40, 20]);
    else if (type === 'error') navigator.vibrate([40, 80, 40]);
};

const playTone = (type, enabled = true) => {
    triggerHaptic(type, enabled);
    if (!enabled) return;
    
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    if (type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now); osc.stop(now + 0.03);
    } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'cancel' || type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    }
};

const i18n = {
    en: {
        app_title: "FastMeat", whole_chicken: "Whole Chicken", ready_chicken: "Readymade", nati_chicken: "Nati Chicken", eggs: "Eggs",
        paid_now: "PAID NOW", in_queue: "IN QUEUE", cancel: "Cancel", queue: "Queue", history: "History", settings: "Settings",
        weight_g: "Weight (g)", price_rs: "Price (₹)", price_whole: "Whole Price/Kg", price_ready: "Ready Price/Kg", price_nati: "Nati Price/Kg", price_egg: "Price/Egg",
        save: "Save", clear: "Clear Data", mark_paid: "Mark Paid", no_transactions: "No transactions yet.",
        extra_items: "Extra Items", total_payable: "Total Payable", tab_sell: "Sell", tab_customers: "Customers", tab_sales: "Sales",
        burning: "Burning", skin_out: "Skin Out (+₹20)", egg_add: "Add Eggs", edit: "Edit", sound_haptics: "Sound & Haptics", queue_toast: "Added to Queue!", today_sales: "Today's Sales"
    },
    kn: {
        app_title: "ಫಾಸ್ಟ್ ಮೀಟ್", whole_chicken: "ಪೂರ್ಣ ಕೋಳಿ", ready_chicken: "ರೆಡಿಮೇಡ್", nati_chicken: "ನಾಟಿ ಕೋಳಿ", eggs: "ಮೊಟ್ಟೆಗಳು",
        paid_now: "ಪಾವತಿಸಲಾಗಿದೆ", in_queue: "ಕ್ಯೂ", cancel: "ರದ್ದು", queue: "ಬಾಕಿ", history: "ಇತಿಹಾಸ", settings: "ಸೆಟ್ಟಿಂಗ್",
        weight_g: "ತೂಕ (g)", price_rs: "ಬೆಲೆ (₹)", price_whole: "ಪೂರ್ಣ/ಕೆಜಿ", price_ready: "ರೆಡಿಮೇಡ್/ಕೆಜಿ", price_nati: "ನಾಟಿ/ಕೆಜಿ", price_egg: "ಬೆಲೆ/ಮೊಟ್ಟೆ",
        save: "ಉಳಿಸು", clear: "ಅಳಿಸು", mark_paid: "ಹಣ ಬಂದಿದೆ", no_transactions: "ವ್ಯಾಪಾರವಿಲ್ಲ.",
        extra_items: "ಇತರೆ ವಸ್ತುಗಳು", total_payable: "ಒಟ್ಟು ಪಾವತಿಸಬೇಕು", tab_sell: "ಮಾರಾಟ", tab_customers: "ಗ್ರಾಹಕರು", tab_sales: "ವ್ಯಾಪಾರ",
        burning: "ಬರ್ನಿಂಗ್", skin_out: "ಸ್ಕಿನ್ ಔಟ್ (+₹20)", egg_add: "ಮೊಟ್ಟೆ ಸೇರಿಸಿ", edit: "ತಿದ್ದು", sound_haptics: "ಶಬ್ದ & ಕಂಪನ", queue_toast: "ಕ್ಯೂಗೆ ಸೇರಿಸಲಾಗಿದೆ!", today_sales: "ಇಂದಿನ ವ್ಯಾಪಾರ"
    },
    hi: {
        app_title: "फ़ास्ट मीट", whole_chicken: "पूरा मुर्गा", ready_chicken: "रेडीमेड", nati_chicken: "नाटी मुर्गा", eggs: "अंडे",
        paid_now: "पैसे मिले", in_queue: "कतार", cancel: "रद्द", queue: "बाकी", history: "इतिहास", settings: "सेटिंग्स",
        weight_g: "वजन (g)", price_rs: "कीमत (₹)", price_whole: "पूरा/किलो", price_ready: "रेडीमेड/किलो", price_nati: "नाटी/किलो", price_egg: "दाम/अंडा",
        save: "सेव करें", clear: "साफ़ करें", mark_paid: "पैसे मिल गए", no_transactions: "कोई लेन-देन नहीं।",
        extra_items: "अन्य सामग्री", total_payable: "कुल देय", tab_sell: "बिक्री", tab_customers: "ग्राहक", tab_sales: "हिसाब",
        burning: "भूनना", skin_out: "स्किन आउट (+₹20)", egg_add: "अंडे जोड़ें", edit: "संपादित", sound_haptics: "ध्वनि & कंपन", queue_toast: "कतार में जोड़ा गया!", today_sales: "आज की बिक्री"
    }
};

function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });
    useEffect(() => { window.localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
    return [value, setValue];
}

export default function App() {
    const [settings, setSettings] = useStickyState({ lang: 'en', sound: true }, 'fm_settings');
    const [prices, setPrices] = useStickyState({ whole: 160, ready: 240, nati: 300, egg: 8 }, 'fm_prices_v3');
    const [transactions, setTransactions] = useStickyState([], 'fm_transactions_v2');
    
    const [mainViewIndex, setMainViewIndex] = useState(0); 
    const tabs = ['sell', 'customers', 'sales'];
    
    const [isTransactionView, setIsTransactionView] = useState(false);
    const [isSettingsView, setIsSettingsView] = useState(false);
    const [showInterstitial, setShowInterstitial] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState(null); 
    const [weightStr, setWeightStr] = useState('');
    const [amountStr, setAmountStr] = useState('');
    const [inputMode, setInputMode] = useState('weight'); 
    
    const [activeField, setActiveField] = useState('chicken');
    const [extrasExp, setExtrasExp] = useState(''); 
    const [eggQtyStr, setEggQtyStr] = useState('');
    
    const [isBurning, setIsBurning] = useState(false);
    const [isSkinOut, setIsSkinOut] = useState(false);
    
    const [editingId, setEditingId] = useState(null); 
    
    const [showPaidAnim, setShowPaidAnim] = useState(false);
    const [lastPaidTotal, setLastPaidTotal] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [lastQueuedTx, setLastQueuedTx] = useState(null);

    const t = i18n[settings.lang];

    const todayString = new Date().toLocaleDateString();
    const queueCount = transactions.filter(tx => new Date(tx.timestamp).toLocaleDateString() === todayString && tx.status === 'queue').length;

    useEffect(() => {
        const listener = CapacitorApp.addListener('backButton', () => {
            if (showInterstitial) setShowInterstitial(false);
            else if (isTransactionView) handleCancel();
            else if (isSettingsView) setIsSettingsView(false);
            else CapacitorApp.exitApp();
        });
        return () => { listener.then(l => l.remove()); }
    }, [isTransactionView, isSettingsView, showInterstitial]);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); }
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEndEvent = () => {
        if (!touchStart || !touchEnd || isTransactionView || isSettingsView || showInterstitial) return;
        const distance = touchStart - touchEnd;
        if (distance > 50 && mainViewIndex < 2) { setMainViewIndex(prev => prev + 1); play('pop'); }
        if (distance < -50 && mainViewIndex > 0) { setMainViewIndex(prev => prev - 1); play('pop'); }
    }

    const play = (type) => playTone(type, settings.sound);

    const handleItemSelect = (item) => {
        play('click');
        setSelectedItem(item);
        setWeightStr('');
        setAmountStr('');
        setInputMode(item === 'egg' ? 'amount' : 'weight'); 
        setActiveField('chicken');
        setExtrasExp('');
        setEggQtyStr('');
        setIsBurning(false);
        setIsSkinOut(false);
        setEditingId(null);
        
        setIsTransactionView(true);
    };

    const handleQuickPriceEdit = (itemType) => {
        if (itemType === 'nati') return;
        const currentPrice = prices[itemType];
        const newPrice = prompt(`Update price for ${itemType} (Current: ₹${currentPrice}):`, currentPrice);
        if (newPrice !== null && !isNaN(newPrice) && newPrice !== "") {
            setPrices(prev => ({ ...prev, [itemType]: Number(newPrice) }));
            play('success');
        }
    };

    const handleModifier = (mod) => {
        play('pop');
        if (mod === 'burn') { setIsBurning(!isBurning); setIsSkinOut(false); }
        else if (mod === 'skin') { setIsSkinOut(!isSkinOut); setIsBurning(false); }
    }

    const handleKeypad = (val) => {
        play('tick');
        
        if (['+', '-', '*'].includes(val)) {
            if (activeField === 'chicken' || activeField === 'eggs') {
                setActiveField('extras');
                if (val === '-') setExtrasExp('-'); else if (val === '+') setExtrasExp('');
            } else {
                if (extrasExp === '' && val !== '-') return;
                if (/[+\-*]$/.test(extrasExp)) setExtrasExp(prev => prev.slice(0, -1) + val);
                else setExtrasExp(prev => prev + val);
            }
            return;
        }

        if (val === 'C') {
            if (activeField === 'extras') { setExtrasExp(''); setActiveField('chicken'); }
            else if (activeField === 'eggs') { setEggQtyStr(''); }
            else { if (inputMode === 'weight') setWeightStr(''); else setAmountStr(''); }
            return;
        }

        if (val === 'BACK') {
            if (activeField === 'extras') {
                if (extrasExp.length > 0) setExtrasExp(prev => prev.slice(0, -1));
                if (extrasExp.length <= 1) setActiveField('chicken');
            } else if (activeField === 'eggs') {
                setEggQtyStr(prev => prev.slice(0, -1));
            } else {
                if (inputMode === 'weight') setWeightStr(prev => prev.slice(0, -1));
                else setAmountStr(prev => prev.slice(0, -1));
            }
            return;
        }

        if (val === 'KG' && inputMode === 'weight' && activeField === 'chicken') {
            if (!weightStr) return;
            const num = parseFloat(weightStr);
            if (!isNaN(num)) {
                let newWeight = num * 1000;
                if (newWeight > 99999) newWeight = 99999;
                setWeightStr(newWeight.toString());
            }
            return;
        }

        if (activeField === 'extras') {
            if (extrasExp.length < 25) setExtrasExp(prev => prev + val);
        } else if (activeField === 'eggs') {
            if (val !== '.' && val !== '00') setEggQtyStr(prev => prev + val); 
        } else {
            const isWeightMode = inputMode === 'weight';
            if (val === '.') {
                if (isWeightMode) { if (!weightStr.includes('.')) setWeightStr(prev => prev === '' ? '0.' : prev + '.'); } 
                else { if (!amountStr.includes('.')) setAmountStr(prev => prev === '' ? '0.' : prev + '.'); }
                return;
            }
            if (val === '00') {
                 if (isWeightMode && weightStr.length < 5) setWeightStr(prev => prev + '00');
                 else if (!isWeightMode && amountStr.length < 5) setAmountStr(prev => prev + '00');
                 return;
            }
            if (isWeightMode && weightStr.length < 6) setWeightStr(prev => prev + val);
            else if (!isWeightMode && amountStr.length < 6) setAmountStr(prev => prev + val);
        }
    };

    const currentPriceKg = selectedItem ? prices[selectedItem] : 0;
    const isChickenItem = selectedItem === 'whole' || selectedItem === 'ready' || selectedItem === 'nati';
    
    let finalWeight = 0;
    let finalPrice = 0;
    let shouldCalculate = false;

    if (selectedItem === 'egg') {
        finalWeight = parseInt(amountStr || '0', 10);
        finalPrice = finalWeight * prices.egg;
        shouldCalculate = finalWeight > 0;
    } else if (isChickenItem) {
        if (inputMode === 'weight') {
            const digitCount = weightStr.replace('.', '').length;
            if (digitCount >= (selectedItem === 'ready' ? 3 : 4)) shouldCalculate = true;
            finalWeight = Math.round(parseFloat(weightStr || '0'));
            finalPrice = shouldCalculate ? Math.round((finalWeight / 1000) * currentPriceKg) : 0;
        } else {
            const digitCount = amountStr.replace('.', '').length;
            if (digitCount > 0) shouldCalculate = true;
            finalPrice = Math.round(parseFloat(amountStr || '0'));
            finalWeight = shouldCalculate ? Math.round((finalPrice / currentPriceKg) * 1000) : 0;
        }
    }

    const evaluateExtras = (exp) => {
        if (!exp) return 0;
        try {
            const cleanExp = exp.replace(/[^0-9+\-*.]/g, '').replace(/[+\-*]+$/, '');
            if (!cleanExp) return 0;
            const result = new Function(`return ${cleanExp}`)();
            return isNaN(result) || !isFinite(result) ? 0 : Math.round(result);
        } catch (e) { return 0; }
    };

    const extrasValue = evaluateExtras(extrasExp);
    const subEggQty = parseInt(eggQtyStr || '0', 10);
    const subEggPrice = subEggQty * prices.egg;
    const skinOutFee = (isSkinOut && isChickenItem) ? 20 : 0;
    const totalPrice = finalPrice + extrasValue + subEggPrice + skinOutFee;

    const handleTransaction = (status) => {
        if (totalPrice <= 0) { play('error'); return; }
        
        const today = new Date().toLocaleDateString();
        const todaysTx = transactions.filter(t => new Date(t.timestamp).toLocaleDateString() === today);
        const newDailyId = editingId ? transactions.find(t => t.id === editingId).dailyId : (todaysTx.length > 0 ? Math.max(...todaysTx.map(t => t.dailyId || 0)) + 1 : 1);

        const newTx = {
            id: editingId || Date.now().toString(),
            dailyId: newDailyId,
            item: selectedItem,
            weight: finalWeight,
            price: totalPrice,
            chickenPrice: finalPrice,
            extrasValue: extrasValue,
            extrasExp: extrasExp,
            inputMode: inputMode,
            status: status,
            isBurning: isBurning,
            isSkinOut: isSkinOut,
            skinOutFee: skinOutFee,
            subEggQty: subEggQty,
            subEggPrice: subEggPrice,
            timestamp: editingId ? transactions.find(t => t.id === editingId).timestamp : new Date().toISOString()
        };

        if (editingId) setTransactions(prev => prev.map(tx => tx.id === editingId ? newTx : tx));
        else setTransactions(prev => [newTx, ...prev]);
        
        if (status === 'paid') {
            play('success');
            setLastPaidTotal(totalPrice);
            setShowPaidAnim(true);
            setTimeout(() => setShowPaidAnim(false), 2000);
        } else {
            play('success');
            setLastQueuedTx(newTx);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
        }

        setSelectedItem(null);
        setEditingId(null);
        setIsTransactionView(false);
        if (editingId) setMainViewIndex(1);
    };

    const handleCancel = () => {
        play('cancel');
        setSelectedItem(null);
        setEditingId(null);
        setIsTransactionView(false);
    };

    const editTransaction = (tx) => {
        play('click');
        setEditingId(tx.id);
        setSelectedItem(tx.item);
        if (tx.item === 'egg') {
            setAmountStr(tx.weight.toString());
            setInputMode('amount');
        } else {
            setWeightStr(tx.weight > 0 ? tx.weight.toString() : '');
            setAmountStr(tx.inputMode === 'amount' ? tx.chickenPrice.toString() : '');
            setInputMode(tx.inputMode || 'weight');
        }
        setExtrasExp(tx.extrasExp || '');
        setEggQtyStr(tx.subEggQty > 0 ? tx.subEggQty.toString() : '');
        setIsBurning(tx.isBurning || false);
        setIsSkinOut(tx.isSkinOut || false);
        setActiveField('chicken');
        setIsTransactionView(true);
    };

    const getImageForItem = (item) => {
        if(item==='whole') return 'img/livechicken.png';
        if(item==='ready') return 'img/wholechicken.png';
        if(item==='nati') return 'img/Nati Chicken.png';
        if(item==='egg') return 'img/egg.png';
        return '';
    }

    const renderSell = () => (
        <div className="h-full flex flex-col p-4 gap-4 bg-utility-bg">
            <div className="grid grid-cols-2 gap-4 h-full">
                <button onClick={() => handleItemSelect('whole')} className="bg-[#FFF5E1] border-4 border-[#FF9800] rounded-2xl p-4 flex flex-col items-center justify-center btn-tactile relative shadow-[4px_4px_0px_#FF9800]">
                    <div className="absolute top-2 right-2 bg-white/70 px-2 py-1 rounded text-[#FF9800] font-black text-xs z-10" onClick={(e)=>{e.stopPropagation(); handleQuickPriceEdit('whole')}}>@ ₹{prices.whole}/kg</div>
                    <img src="img/livechicken.png" className="h-24 w-24 object-contain mb-2 drop-shadow-md" alt="Whole" />
                    <span className="text-xl font-black text-gray-900 uppercase text-center leading-tight">{t.whole_chicken}</span>
                </button>
                <button onClick={() => handleItemSelect('ready')} className="bg-[#FFEbee] border-4 border-[#F44336] rounded-2xl p-4 flex flex-col items-center justify-center btn-tactile relative shadow-[4px_4px_0px_#F44336]">
                    <div className="absolute top-2 right-2 bg-white/70 px-2 py-1 rounded text-[#F44336] font-black text-xs z-10" onClick={(e)=>{e.stopPropagation(); handleQuickPriceEdit('ready')}}>@ ₹{prices.ready}/kg</div>
                    <img src="img/wholechicken.png" className="h-24 w-24 object-contain mb-2 drop-shadow-md" alt="Ready" />
                    <span className="text-xl font-black text-gray-900 uppercase text-center leading-tight">{t.ready_chicken}</span>
                </button>
                <button onClick={() => handleItemSelect('nati')} className="bg-[#E8F5E9] border-4 border-[#4CAF50] rounded-2xl p-4 flex flex-col items-center justify-center btn-tactile relative shadow-[4px_4px_0px_#4CAF50]">
                    <div className="absolute top-2 right-2 bg-white/70 px-2 py-1 rounded text-[#4CAF50] font-black text-xs z-10">@ ₹{prices.nati}/kg</div>
                    <img src="img/Nati Chicken.png" className="h-24 w-24 object-contain mb-2 drop-shadow-md" alt="Nati" />
                    <span className="text-xl font-black text-gray-900 uppercase text-center leading-tight">{t.nati_chicken}</span>
                </button>
                <button onClick={() => handleItemSelect('egg')} className="bg-[#E3F2FD] border-4 border-[#2196F3] rounded-2xl p-4 flex flex-col items-center justify-center btn-tactile relative shadow-[4px_4px_0px_#2196F3]">
                    <div className="absolute top-2 right-2 bg-white/70 px-2 py-1 rounded text-[#2196F3] font-black text-xs z-10" onClick={(e)=>{e.stopPropagation(); handleQuickPriceEdit('egg')}}>@ ₹{prices.egg}/pc</div>
                    <img src="img/egg.png" className="h-24 w-24 object-contain mb-2 drop-shadow-md" alt="Eggs" />
                    <span className="text-xl font-black text-gray-900 uppercase text-center leading-tight">{t.eggs}</span>
                </button>
            </div>
        </div>
    );

    const renderCustomers = () => {
        const today = new Date().toLocaleDateString();
        const todayTx = transactions.filter(tx => new Date(tx.timestamp).toLocaleDateString() === today);
        const queueTx = todayTx.filter(tx => tx.status === 'queue');
        const paidTx = todayTx.filter(tx => tx.status === 'paid');
        
        const markPaid = (e, id) => { e.stopPropagation(); play('success'); setTransactions(transactions.map(tx => tx.id === id ? { ...tx, status: 'paid' } : tx)); };
        const deleteTx = (e, id) => { e.stopPropagation(); if(confirm("Delete this entry?")) { play('cancel'); setTransactions(transactions.filter(tx => tx.id !== id)); } }

        const renderList = (list) => (
            list.length === 0 ? <div className="text-center text-gray-400 py-4 text-sm font-bold opacity-50">{t.no_transactions}</div> : list.map(tx => (
                <div key={tx.id} onClick={() => editTransaction(tx)} className="bg-white p-3 rounded-xl shadow-sm border-l-4 flex justify-between items-center mb-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 btn-tactile transition-all" style={{ borderLeftColor: tx.status === 'paid' ? '#43A047' : '#FDD835' }}>
                    <div className="flex gap-3 items-center">
                        <div className="bg-gray-100 rounded-lg p-1.5 shrink-0 flex flex-col items-center">
                            <img src={getImageForItem(tx.item)} className="w-8 h-8 object-contain" />
                            <span className="text-[9px] font-black text-gray-500">#{tx.dailyId}</span>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 flex items-center gap-1 flex-wrap">
                                {tx.item === 'egg' ? `${tx.weight} pcs` : (tx.weight > 0 ? `${tx.weight}g` : 'Extras Only')}
                                {tx.isBurning && <img src="img/burning.png" className="w-4 h-4 object-contain ml-1" />}
                                {tx.isSkinOut && <img src="img/Skinoutimage.png" className="w-4 h-4 object-contain ml-1" />}
                            </div>
                            <div className="text-xl font-black text-gray-900">₹{tx.price}</div>
                            {tx.subEggQty > 0 && <div className="text-[10px] text-blue-600 font-bold mt-1 bg-blue-50 px-2 py-0.5 rounded inline-block uppercase mr-1">+ {tx.subEggQty} {t.eggs}</div>}
                            {tx.extrasValue > 0 && <div className="text-[10px] text-purple-600 font-bold mt-1 bg-purple-50 px-2 py-0.5 rounded inline-block uppercase">+ Extras</div>}
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        {tx.status === 'queue' && <button onClick={(e) => markPaid(e, tx.id)} className="bg-utility-green text-white px-3 py-2 rounded-lg font-bold text-sm btn-tactile shadow-hard">{t.mark_paid}</button>}
                        <button onClick={(e) => deleteTx(e, tx.id)} className="bg-gray-200 text-gray-600 p-2 rounded-lg btn-tactile"><Trash2 className="w-5 h-5"/></button>
                    </div>
                </div>
            ))
        );

        return (
            <div className="h-full flex flex-col bg-gray-100">
                <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                    <h3 className="font-black text-gray-500 uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-utility-yellow inline-block"></span>{t.queue} ({queueTx.length})</h3>
                    {renderList(queueTx)}
                    <div className="h-px bg-gray-300 w-full my-6"></div>
                    <h3 className="font-black text-gray-500 uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-utility-green inline-block"></span>{t.paid_now} ({paidTx.length})</h3>
                    {renderList(paidTx)}
                </div>
            </div>
        );
    };

    const renderSales = () => {
        const today = new Date().toLocaleDateString();
        const paidTx = transactions.filter(tx => new Date(tx.timestamp).toLocaleDateString() === today && tx.status === 'paid');
        
        const [expandedCard, setExpandedCard] = useState(null);

        const totalRev = paidTx.reduce((sum, tx) => sum + tx.price, 0);
        
        const calcCard = (type) => {
            const txs = paidTx.filter(t => t.item === type);
            const rev = txs.reduce((sum, t) => sum + t.chickenPrice, 0);
            const burn = txs.filter(t => t.isBurning).length;
            const skin = txs.filter(t => t.isSkinOut).length;
            return { txs, rev, burn, skin };
        };

        const whole = calcCard('whole');
        const ready = calcCard('ready');
        const nati = calcCard('nati');
        
        const eggRev = paidTx.filter(tx => tx.item === 'egg').reduce((sum, tx) => sum + tx.chickenPrice, 0) + paidTx.reduce((sum, tx) => sum + (tx.subEggPrice || 0), 0);
        const miscRev = paidTx.reduce((sum, tx) => sum + tx.extrasValue + (tx.skinOutFee || 0), 0);

        const SalesCard = ({ id, title, data, color }) => (
            <div onClick={() => {play('click'); setExpandedCard(expandedCard === id ? null : id)}} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 btn-tactile cursor-pointer ${color} ${expandedCard === id ? 'col-span-2' : ''}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">{title}</div>
                        <div className="text-xl font-black text-gray-900 font-mono mt-1">₹{data.rev}</div>
                    </div>
                    {expandedCard === id ? <ChevronUp className="w-5 h-5 text-gray-400"/> : <ChevronDown className="w-5 h-5 text-gray-400"/>}
                </div>
                {expandedCard === id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around">
                        <div className="text-center">
                            <img src="img/burning.png" className="w-6 h-6 mx-auto mb-1 opacity-80" />
                            <div className="font-black text-gray-800">{data.burn} Orders</div>
                        </div>
                        <div className="text-center">
                            <img src="img/Skinoutimage.png" className="w-6 h-6 mx-auto mb-1 opacity-80" />
                            <div className="font-black text-gray-800">{data.skin} Orders</div>
                        </div>
                    </div>
                )}
            </div>
        );

        return (
            <div className="h-full flex flex-col bg-gray-100">
                <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">{t.today_sales}</div>
                            <div className="text-5xl font-black font-mono tracking-tighter text-utility-yellow">₹{totalRev}</div>
                            <div className="mt-4 text-sm font-bold text-gray-300 bg-white/10 inline-block px-3 py-1 rounded-full">{paidTx.length} Orders Today</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SalesCard id="whole" title={t.whole_chicken} data={whole} color="border-[#FF9800]" />
                        <SalesCard id="ready" title={t.ready_chicken} data={ready} color="border-[#F44336]" />
                        <SalesCard id="nati" title={t.nati_chicken} data={nati} color="border-[#4CAF50]" />
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#2196F3]">
                            <div className="text-xs font-bold text-gray-500 uppercase">{t.eggs}</div>
                            <div className="text-xl font-black text-gray-900 font-mono mt-1">₹{eggRev}</div>
                        </div>
                        <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500">
                            <div className="text-xs font-bold text-gray-500 uppercase">Extras & Skin Out Fees</div>
                            <div className="text-xl font-black text-gray-900 font-mono mt-1">₹{miscRev}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTransaction = () => {
        const colors = {
            whole: { bg: 'bg-[#FF9800]', text: 'text-[#FF9800]' },
            ready: { bg: 'bg-[#F44336]', text: 'text-[#F44336]' },
            nati:  { bg: 'bg-[#4CAF50]', text: 'text-[#4CAF50]' },
            egg:   { bg: 'bg-[#2196F3]', text: 'text-[#2196F3]' }
        };
        const theme = colors[selectedItem];
        const showKgButton = selectedItem === 'ready' && inputMode === 'weight'; // Removed from Nati
        const titleKey = selectedItem === 'whole' ? 'whole_chicken' : selectedItem === 'ready' ? 'ready_chicken' : selectedItem === 'nati' ? 'nati_chicken' : 'eggs';

        return (
            <div className="flex-1 flex flex-col bg-gray-100 h-full w-full overflow-hidden absolute top-0 left-0 z-50 animate-fade-in">
                <div className={`${theme.bg} text-white p-3 flex justify-between items-center shadow-md shrink-0`}>
                    <div className="font-black text-lg uppercase flex items-center gap-2">
                        <ArrowLeft className="w-6 h-6 cursor-pointer btn-tactile" onClick={handleCancel} />
                        {editingId && <span className="bg-white/30 px-2 rounded text-sm"><Edit className="w-4 h-4 inline" /></span>}
                        {t[titleKey]}
                    </div>
                    {selectedItem !== 'nati' ? (
                        <div className="font-bold bg-white/20 px-2 py-1 rounded cursor-pointer btn-tactile" onClick={() => handleQuickPriceEdit(selectedItem)}>
                            @ ₹{currentPriceKg}/{selectedItem === 'egg' ? 'pc' : 'kg'} <Edit2 className="w-3 h-3 inline" />
                        </div>
                    ) : (
                        <div className="font-bold bg-white/20 px-2 py-1 rounded">@ ₹{currentPriceKg}/kg</div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col relative">

                    <div onClick={() => { play('click'); setActiveField('chicken'); }} className={`bg-white p-3 shadow-sm border-b-2 transition-colors cursor-pointer shrink-0 ${activeField === 'chicken' ? 'bg-blue-50 border-utility-blue ring-inset ring-4 ring-blue-400' : 'border-gray-200'}`}>
                        {isChickenItem ? (
                            <div className="flex gap-2 items-stretch">
                                <div onClick={(e) => { if(selectedItem==='whole' || selectedItem==='nati')return; if(activeField==='chicken'){ play('pop'); if(inputMode==='amount'){setWeightStr(shouldCalculate?finalWeight.toString():''); setInputMode('weight');} } }}
                                    className={`flex-1 py-2 px-1 rounded-xl border-4 flex flex-col items-center justify-center relative ${inputMode === 'weight' ? `border-gray-800 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.8)]` : 'border-transparent bg-gray-100 opacity-60'}`}
                                >
                                    <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Edit2 className={`w-3 h-3 ${inputMode==='weight'&&activeField==='chicken'?'block':'hidden'}`} /> {t.weight_g}</div>
                                    <div className={`text-2xl font-mono font-black ${inputMode==='weight'&&activeField==='chicken'?'text-gray-900':'text-gray-500'}`}>{inputMode==='weight'?(weightStr||'0'):finalWeight}</div>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-1">
                                    {(selectedItem==='whole' || selectedItem==='nati') ? <Equal className="w-5 h-5 text-gray-400" /> : <ArrowRightLeft className="w-5 h-5 text-gray-400" />}
                                </div>
                                <div onClick={(e) => { if(selectedItem==='whole' || selectedItem==='nati')return; if(activeField==='chicken'){ play('pop'); if(inputMode==='weight'){setAmountStr(shouldCalculate?finalPrice.toString():''); setInputMode('amount');} } }}
                                    className={`flex-1 py-2 px-1 rounded-xl border-4 flex flex-col items-center justify-center relative ${inputMode === 'amount' ? 'border-utility-green bg-green-50 shadow-[4px_4px_0px_#43A047]' : ((selectedItem==='whole'||selectedItem==='nati')?'border-transparent bg-green-50':'border-transparent bg-gray-100 opacity-60')}`}
                                >
                                    <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Edit2 className={`w-3 h-3 ${inputMode==='amount'&&activeField==='chicken'?'block text-utility-green':'hidden'}`} /> {t.price_rs}</div>
                                    {/* Nati Chicken Price Highlight Fix */}
                                    <div className={`text-2xl font-mono font-black ${inputMode==='amount'||selectedItem==='whole'||(selectedItem==='nati' && shouldCalculate)?(activeField==='chicken'?'text-utility-green':'text-green-700/60'):'text-green-600/50'}`}>₹{inputMode==='amount'?(amountStr||'0'):(shouldCalculate?finalPrice:'---')}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center px-4 py-2">
                                <div className="text-sm font-bold text-gray-500 uppercase">Quantity (pcs)</div>
                                <div className="text-3xl font-mono font-black text-gray-900">{amountStr || '0'}</div>
                                <div className="text-2xl font-mono font-bold text-utility-green">₹{finalPrice}</div>
                            </div>
                        )}
                    </div>

                    {selectedItem !== 'egg' && (
                        <div onClick={() => { play('click'); setActiveField('eggs'); }} className={`bg-white p-3 shadow-sm flex justify-between items-center transition-colors cursor-pointer shrink-0 ${activeField === 'eggs' ? 'bg-blue-50 border-blue-500 ring-inset ring-4 ring-blue-400' : 'border-b-2 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <img src="img/egg.png" className="w-8 h-8 object-contain drop-shadow-sm" alt="egg" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                        {t.egg_add} (@ ₹{prices.egg}) <Edit2 className={`w-3 h-3 ${activeField==='eggs'?'text-blue-500':'hidden'}`} />
                                    </span>
                                    <span className="text-xl font-mono font-black text-gray-800 tracking-wider h-7 flex items-center">
                                        {eggQtyStr ? `${eggQtyStr} pcs` : <span className="text-gray-300 font-normal text-sm italic">Tap to add</span>}
                                        {activeField === 'eggs' && <span className="animate-pulse inline-block w-2 h-5 bg-blue-500 ml-1"></span>}
                                    </span>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-blue-700 font-mono">+{subEggPrice > 0 ? `₹${subEggPrice}` : ''}</div>
                        </div>
                    )}

                    <div onClick={() => { play('click'); setActiveField('extras'); }} className={`bg-white p-3 shadow-sm flex justify-between items-center transition-colors cursor-pointer shrink-0 ${activeField === 'extras' ? 'bg-purple-50 border-purple-500 ring-inset ring-4 ring-purple-400' : 'border-b-2 border-gray-200'}`}>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                                <PlusCircle className="w-3 h-3" /> {t.extra_items}
                            </span>
                            <span className="text-xl font-mono font-black text-gray-800 tracking-wider h-7 flex items-center">
                                {extrasExp ? extrasExp.replace(/\*/g, '×').replace(/-/g, '−') : <span className="text-gray-300 font-normal text-sm italic">Masala, covers...</span>}
                                {activeField === 'extras' && <span className="animate-pulse inline-block w-2 h-5 bg-purple-500 ml-1"></span>}
                            </span>
                        </div>
                        <div className="text-2xl font-black text-purple-700 font-mono">+₹{extrasValue}</div>
                    </div>
                </div>

                <div className="flex flex-col shrink-0 bg-gray-200 border-t-2 border-gray-300 shadow-[0_-10px_20px_rgba(0,0,0,0.15)] z-20">
                    <div className="bg-gray-800 text-white p-3 flex justify-between items-center shadow-[inset_0_4px_4px_rgba(0,0,0,0.3)] border-b-4 border-utility-dark">
                        <span className="text-sm font-black uppercase text-gray-300 tracking-wider flex items-center gap-2"><Calculator className="w-4 h-4" /> {t.total_payable}</span>
                        <span className="text-4xl font-black text-utility-yellow font-mono">₹{totalPrice}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 p-2 bg-gray-200">
                        {['1','2','3','BACK','4','5','6','+','7','8','9','-','0','00','.','*'].map((key, i) => {
                            if (key === '00' && selectedItem === 'egg') return <div key={`empty-${i}`}></div>;
                            let bgColor = 'bg-white', textColor = 'text-gray-800', label = key, borderColor = 'border-gray-300';
                            if (['+','-','*'].includes(key)) { bgColor = 'bg-gray-300'; textColor = 'text-gray-900 text-3xl'; borderColor = 'border-gray-400'; if(key==='*')label='×'; if(key==='-')label='−'; }
                            if (key === 'BACK') return <button key={key} onClick={() => handleKeypad(key)} className="bg-gray-300 text-gray-700 rounded-xl border-b-4 border-gray-400 btn-tactile flex items-center justify-center py-1 h-12 lg:h-14"><Trash2 className="w-6 h-6" /></button>;
                            return <button key={key} onClick={() => handleKeypad(key)} className={`${bgColor} ${textColor} text-3xl font-mono font-bold rounded-xl border-b-4 ${borderColor} btn-tactile flex items-center justify-center py-1 h-12 lg:h-14`}>{label}</button>;
                        })}
                        
                        {/* 5th Row */}
                        <div className="col-span-4 flex gap-2">
                            <button onClick={() => handleKeypad('C')} className="bg-white text-red-500 text-3xl font-mono font-bold rounded-xl border-b-4 border-gray-300 btn-tactile flex items-center justify-center py-1 h-12 lg:h-14" style={{width: 'calc(25% - 0.375rem)'}}>C</button>
                            
                            {selectedItem === 'ready' && (
                                <button onClick={() => handleKeypad('KG')} className="bg-utility-blue text-white text-xl font-mono font-bold rounded-xl border-b-4 border-blue-700 btn-tactile flex items-center justify-center py-1 h-12 lg:h-14" style={{width: 'calc(25% - 0.375rem)'}}>KG</button>
                            )}
                            
                            {isChickenItem && (
                                <div className="flex-1 flex gap-2">
                                    <button onClick={() => handleModifier('burn')} className={`flex-1 rounded-xl border-b-4 flex flex-col items-center justify-center py-1 h-12 lg:h-14 btn-tactile ${isBurning ? 'bg-orange-100 border-orange-500 text-orange-800' : 'bg-white border-gray-300 text-gray-700'}`}>
                                        <img src="img/burning.png" className="w-5 h-5 mb-0.5" />
                                        <span className="text-[8px] font-black uppercase leading-tight text-center px-0.5 max-w-full overflow-hidden">{t.burning.replace(' (+₹20)', '')}</span>
                                    </button>
                                    <button onClick={() => handleModifier('skin')} className={`flex-1 rounded-xl border-b-4 flex flex-col items-center justify-center py-1 h-12 lg:h-14 btn-tactile ${isSkinOut ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-gray-300 text-gray-700'}`}>
                                        <img src="img/Skinoutimage.png" className="w-5 h-5 mb-0.5" />
                                        <span className="text-[8px] font-black uppercase leading-tight text-center px-0.5 max-w-full overflow-hidden">{t.skin_out.replace(' (+₹20)', '')} <span className="text-[7px] block">+₹20</span></span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="px-2 pb-2 bg-gray-200 flex flex-col gap-2 pb-safe">
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={handleCancel} className="col-span-1 bg-red-100 text-red-600 border-b-4 border-red-200 rounded-xl font-bold btn-tactile text-xs uppercase flex flex-col items-center justify-center py-1 h-14"><X className="w-5 h-5 mb-1" />{t.cancel}</button>
                            <button onClick={() => handleTransaction('queue')} disabled={totalPrice <= 0} className="col-span-1 bg-utility-yellow text-utility-dark border-b-4 border-[#FBC02D] rounded-xl font-black btn-tactile text-xs uppercase flex flex-col items-center justify-center disabled:opacity-50 h-14"><Clock className="w-5 h-5 mb-1" />{t.queue}</button>
                            <button onClick={() => handleTransaction('paid')} disabled={totalPrice <= 0} className="col-span-2 bg-utility-green text-white border-b-4 border-[#2E7D32] rounded-xl font-black btn-tactile text-lg uppercase flex items-center justify-center gap-2 disabled:opacity-50 h-14"><CheckCircle className="w-6 h-6" />{t.paid_now}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div className="flex-1 flex flex-col bg-gray-100 h-full overflow-hidden absolute top-0 left-0 w-full z-50 animate-fade-in">
            <div className="bg-utility-dark text-white p-4 flex justify-between items-center shadow-md shrink-0">
                <h2 className="font-bold text-lg flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> {t.settings}</h2>
                <button onClick={() => { play('click'); setIsSettingsView(false); }} className="p-2 bg-gray-800 rounded-lg btn-tactile"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 hide-scrollbar">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-black text-gray-400 uppercase tracking-wider text-xs">Language</div>
                    <div className="p-4 grid grid-cols-3 gap-2">
                        {[{id:'en', label:'English'}, {id:'kn', label:'ಕನ್ನಡ'}, {id:'hi', label:'हिंदी'}].map(l => (
                            <button key={l.id} onClick={() => { play('pop'); setSettings({...settings, lang: l.id}); }} className={`py-3 rounded-lg font-bold border-2 btn-tactile ${settings.lang === l.id ? 'bg-blue-50 border-utility-blue text-utility-blue' : 'border-gray-200 text-gray-600'}`}>{l.label}</button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-black text-gray-400 uppercase tracking-wider text-xs">{t.sound_haptics}</div>
                    <div className="p-4 flex justify-between items-center">
                        <span className="font-bold text-gray-700">Enable</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.sound} onChange={(e) => { play('click'); setSettings({...settings, sound: e.target.checked}); }} />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-utility-green"></div>
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-black text-gray-400 uppercase tracking-wider text-xs">Danger Zone</div>
                    <div className="p-4">
                        <button onClick={() => { if(confirm("Are you sure? This will delete all sales history forever!")) { play('error'); setTransactions([]); setIsSettingsView(false); } }} className="w-full py-4 bg-red-50 text-red-600 font-black rounded-lg border-2 border-red-200 flex justify-center items-center gap-2 btn-tactile">
                            <AlertTriangle className="w-5 h-5" /> {t.clear}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col relative w-full overflow-hidden selection:bg-transparent bg-gray-100" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndEvent}>
            
            <div className="bg-utility-dark text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
                <h1 className="font-black text-xl tracking-wider flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-utility-yellow" />
                    {t.app_title}
                </h1>
                <div className="flex gap-4">
                    <button onClick={() => { play('click'); setIsSettingsView(true); }} className="p-2 bg-gray-800 rounded-lg btn-tactile">
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
                <div className="swipe-container" style={{ transform: `translateX(-${mainViewIndex * 33.333}%)` }}>
                    <div className="swipe-view">{renderSell()}</div>
                    <div className="swipe-view">{renderCustomers()}</div>
                    <div className="swipe-view">{renderSales()}</div>
                </div>
            </div>
            
            <div className="flex bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20 shrink-0 pb-safe">
                {tabs.map((tab, idx) => (
                    <button key={tab} onClick={() => { play('pop'); setMainViewIndex(idx); }}
                        className={`flex-1 py-4 flex flex-col items-center gap-1 font-bold text-xs uppercase transition-colors relative ${mainViewIndex === idx ? 'text-utility-blue border-t-4 border-utility-blue bg-blue-50' : 'text-gray-400 border-t-4 border-transparent'}`}>
                        <div className="relative">
                            {tab === 'sell' && <ShoppingCart className="w-5 h-5" />}
                            {tab === 'customers' && <Users className="w-5 h-5" />}
                            {tab === 'sales' && <BarChart2 className="w-5 h-5" />}
                            
                            {/* Notification Badge */}
                            {tab === 'customers' && queueCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-black w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                    {queueCount}
                                </span>
                            )}
                        </div>
                        {t[`tab_${tab}`]}
                    </button>
                ))}
            </div>

            {isTransactionView && renderTransaction()}
            {isSettingsView && renderSettings()}
            
            {showPaidAnim && (
                <div className="success-overlay cursor-pointer" style={{pointerEvents: 'auto'}} onClick={(e) => { e.stopPropagation(); play('pop'); setShowPaidAnim(false); }}>
                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="25" fill="none" stroke="white" strokeWidth="2" />
                      <path fill="none" stroke="white" strokeWidth="5" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                    <div className="text-white text-5xl font-mono font-black mt-4 drop-shadow-lg">₹{lastPaidTotal}</div>
                </div>
            )}
            
            {showToast && lastQueuedTx && (
                <div className="queue-toast">
                    <img src={getImageForItem(lastQueuedTx.item)} className="w-10 h-10 object-contain shrink-0" />
                    <div className="flex flex-col flex-1">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{t.queue_toast}</span>
                        <span className="text-lg font-mono font-black text-gray-900">₹{lastQueuedTx.price}</span>
                    </div>
                    <div className="text-xs font-black text-gray-400">#{lastQueuedTx.dailyId}</div>
                    <div className="toast-progress"></div>
                </div>
            )}
        </div>
    );
}
