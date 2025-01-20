import  { createContext, useContext, useEffect , useState ,useCallback, useRef} from 'react'
import { Game_Config } from '../Config/Game_Config'

const GameStateContext = createContext();

const GameStateProvider = ({children}) => {

    const [tapsLeft, setTapsLeft] = useState(Game_Config.initialTaps);
    const [sessionTapCount , setSessionTapCount] = useState(0);
    const [dailyTapCount, setDailyTapCount] = useState(Game_Config.dailyTapCount);
    const [dailyTapLimit , setDailyTapLimit] = useState(Game_Config.dailyTapLimit);
    const [totalGems , setTotalGems] = useState(0);
    const [lastRegenTime , setLastRegenTime] = useState(Date.now());

    const uiElemnts = useRef({
        gemCount : null,
        dailyTapCount : null,
        tapCount : null,
        sessionTapCount : null,
    });

    useEffect( ()=>{
        try {
            const savedData = JSON.parse(localStorage.getItem("tapGameData")) || {};

            const dailyData = loadDailyTapCount();

            setTapsLeft( savedData.tapsLeft || Game_Config.initialTaps );
            setSessionTapCount( savedData.sessionTapCount || 0 );
            setDailyTapCount(dailyData);
            setTotalGems( savedData.totalGems || 0 );
            setLastRegenTime( savedData.lastRegenTime || Date.now() );
            
        } catch (error) {
             console.error( " Error loading saved data" , error );
             resetGame();
        }
    },[])


    const saveState = useCallback( () =>{
        try {
            const state = 
         {   
                tapsLeft,
                sessionTapCount,
                lastRegenTime,
                totalGems,
                lastSaveTime : Date.now()
        };

        localStorage.setItem("tapGameData" ,JSON.stringify(state));
        localStorage.setItem("tapGameData_backup" , JSON.stringify(state));
            
        } catch (error) {
            console.error(" Error saving game state" , error);
            const backup = localStorage.getItem("tapGameData_backup");
            if(backup){
                localStorage.setItem("tapGameData" , backup);
            }
        }
    } ,[tapsLeft,sessionTapCount,lastRegenTime,totalGems])


    const loadDailyTapCount = () =>{
      try {
          const savedData = JSON.parse(localStorage.getItem("dailyTapCount"));
          const today = new Date().toISOString().split("T")[0]

          if(savedData?.date === today){
            setDailyTapLimit(savedData.dailyTapLimit || Game_Config.dailyTapLimit);
          }
          resetDailyTaps();
          return Game_Config.dailyTapLimit;
      } catch (error) {
        console.error(" Error loading daily tap count" , error);
        resetDailyTaps();
        return Game_Config.dailyTapLimit;
      }

    };


    const saveDailyTapCount = useCallback(
        ( remainingTaps) => {
            const today = new Date().toISOString().split("T")[0];
            localStorage.setItem(
                "dailyTapData",
                JSON.stringify({
                    date: today,
                    remainingTaps,
                    dailyTapLimit
                })
            )

        },[dailyTapLimit]
    )

const resetDailyTaps = useCallback( () =>{
    setDailyTapLimit( Game_Config.dailyTapLimit)
    setDailyTapCount(Game_Config.dailyTapLimit)
    saveDailyTapCount(Game_Config.dailyTapLimit)
})
const regenerateTaps = useCallback ( () =>{
        const currentTime = Date.now();
        const timeElapsed  =currentTime -lastRegenTime
        const taspToRegen = Math.floor(timeElapsed/ Game_Config.tapRegenInterval)  
        
        if(taspToRegen > 0){
            const newDailyTapCount = Math.min(
                dailyTapLimit,
                dailyTapCount + taspToRegen
            );
            setDailyTapCount(newDailyTapCount);
            saveDailyTapCount(newDailyTapCount);
            setLastRegenTime( lastRegenTime + taspToRegen * Game_Config.tapRegenInterval);
            saveState();
        }
} ,[dailyTapCount, dailyTapLimit, lastRegenTime,saveDailyTapCount, saveState]);

const addGems = useCallback( (amount) =>{
    setTotalGems( (prev) =>prev + amount);
    saveState();

},
[saveState]
);
const spendGems = useCallback( (amount) =>{
       if(totalGems >= amount){
        setTotalGems( (prev => prev - amount));
        saveState();
        return true;
       }
       return false;
}, [ totalGems , saveState])

  const resetGame = useCallback( () =>{
    setTapsLeft(Game_Config.initialTaps);
    setSessionTapCount(0);
    setDailyTapLimit(Game_Config.dailyTapLimit);
    setDailyTapCount(Game_Config.dailyTapLimit);
    setTotalGems(0);
    setLastRegenTime(Date.now());

    localStorage.removeItem("tapGameData");
    localStorage.removeItem('dailyTapData')
    localStorage.removeItem("activeBoosts")
    localStorage.removeItem("boostTimers")
  },[])

  const value ={
    tapsLeft,
    sessionTapCount,
    dailyTapLimit,
    dailyTapCount,
    totalGems,
    regenerateTaps,
    addGems,
    spendGems,
    resetGame,
  }
  return (
    <GameStateContext.Provider value={value}>
        {children}
    </GameStateContext.Provider>
  )
  
}
export default GameStateProvider;

export  const  useGameState = () =>{
    return useContext(GameStateContext)
}