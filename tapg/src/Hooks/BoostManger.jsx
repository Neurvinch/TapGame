import {useState,useRef,useCallback} from 'react'
import { Game_Config } from '../Config/Game_Config';


const BoostManager = () => {

    const [activeBoosts , setActiveBoosts] = useState({
        potion : false,
        sword : false,
        bag: false,
        book: false,
    });

    const boostTimers = useRef({
        potion : null,
        sword : null,
        bag: null,
        book: null,
    });

      const potionInterval =useRef(null);

    //   useCallback(() =>{

    //     const savedBoosts = localStorage.getItem('activeBoosts');
    //     if(savedBoosts){
    //         loadBoosts();
    //     } else{
    //         updateBoostDisplay();
    //     }
    //     return () =>{
    //         resetBoosts();
    //     }
    //   },[])

    //   const loadBoosts =  useCallback(() =>{
    //     try {
    //         const savedBoosts = JSON.parse(localStorage.getItem('activeBoosts') || "{}");
    //         setActiveBoosts(savedBoosts);
    //         loadSavedTimers;
            
    //     } catch (error) {
    //         console.error( " Error loading boosts:", error );
    //         resetBoosts();
    //     }
    //   },[]) ;

      const loadSavedTimers = useCallback(() =>{
        const savesTimers  =JSON.parse(localStorage.getItem("boostTimers") || "{}");
        const currentTime  = Date.now();

        Object.entries(savesTimers).forEach( ([boostType, endTime])  =>{
            if(endTime && endTime > currentTime){
                const timeLeft = endTime -currentTime;
                startBoostTimer(boostType,timeLeft)

                if(boostTimers === "potion "  && !potionInterval.current){
                    startPotionEffect();
                }

            }
            else{
                deactivateBoost(boostType);
            }
        } )
      },[])

      const handleBoostActivation = useCallback( (boostType) =>{
        if(!Game_Config.boostPrices[boostType] ||
            activeBoosts[boostType]
        ) return;

        if(GameState.spendGems(Game_Config.boostPrices[boostType])){
            activeBoosts(boostType , 
                Game_Config.boostDurations[boostType]
            )
        }
      },[])

      const activateBoost = useCallback(( boostType, duration) =>{ if(activeBoosts[boostType]) return false;

        setActiveBoosts( (prev) =>({
            ...prev, [boostType] : true
        }))
          if(boostType === "book"){
            GameState.setDailyTapLimits(Game_Config.dailyTapLimit * 2);
          }      

          if(boostType === "potion"){
            startPotionEffect();
      }

      startBoostTimer(boostType,duration)
      saveBoosts();
      updateBoostDisplay();

      return true;
    },[]);

    const deactivateBoost = useCallback( (boostType) =>{
        setActiveBoosts( (prev) =>({
            ...prev, [boostType] : false
        }))
        if(boostType === "book"){
            GameState.setDailyTapLimits(Game_Config.dailyTapLimit);
            }
            if(boostType === "potion"){
                stopPotionEffect();
                }

            if(boostTimers.current(boostType)){
                clearTimeout(boostTimers.current[boostType]);
                boostTimers.current[boostType] = null;
            }    
            removeBoostTimer(boostType);
            saveBoosts();
            updateBoostDisplay();

    } ,[]);

    const startPotionEffect = useCallback( () =>{
        if(potionInterval.current){
            clearInterval(potionInterval.current);
        }

        potionInterval.current = setInterval( ()=>{
            if(!activeBoosts.potion || GameState.tapsLeft <= 0 || gameSatate.dailyTapCount <=0) {
                stopPotionEffect();
                return;
            }
            const baseTap = 1;
            const { tapMultiplier, gemMultiplier} = getMultiplier();

            const effectiveTaps = Math.min(gameState.tapsLeft ,baseTap * tapMultiplier)
            gameState.tapsLeft -= effectiveTaps;
            gameState.sessionTapCount += effectiveTaps;
            gameState.dailyTapCount = Math.max(0, gameState.dailyTapCount - 1);

            const gemsEarned = Game_Config.gemsPerTap * effectiveTaps * gemMultiplier;
            gameState.addGems(gemsEarned);

            gameState.savDailyTapCount(gameState.dailyTapCount)
            gameState.saveState();
 

        },Game_Config.potionInterval );
    } ,[]);

    const stopPotionEffect = useCallback(() =>
    {
        if(potionInterval.current){
            clearInterval(potionInterval.current);
            potionInterval.current = null;
        }
    },[]);
  return {
    startPotionEffect,
    stopPotionEffect,
    loadBoosts,
    saveBoosts,
    deactivateBoost,
    activateBoost,
    handleBoostActivation,
    loadSavedTimers,

  
}
}

export default BoostManager