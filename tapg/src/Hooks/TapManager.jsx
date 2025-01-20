import { useState,useRef,useCallback}  from 'react'

import { Game_Config } from '../Config/Game_Config'
 export const TapManager = () => {
    const [tapsLeft , setTapsLeft] = useState(GameState.tapsLeft);
    const [dailyTapCount, setDailyTapCount] = useState(gameState.dailyTapCount);
    const [circleImage,setCircleImage] = useState("Chest/1/Chest1_1.png");
    const tapCircleRef = useRef(null);
    const particleSystemRef = useRef(null);

        
//    useCallback( () =>{
//         particleSystemRef.current = new particleSystemRef("particleCanvas");
//          gameState.loadState();

//          const regenInterval = setInterval(() =>{
//             gameState.regenerateTaps();
//             setDailyTapCount(gameState.dailyTapCount);
//          }, Game_Config.tapRegenInterval)

//          return () => clearInterval(regenInterval)
//     },[]);


    const createTapEffects = useCallback(() =>{
        if(tapCircleRef.current) {
            setCircleImage( "Chest/1/Chest1_2.png");

            const rect = tapCircleRef.current.getBoundingClinetRect();
            particleSystemRef.current.createParticle(rect.width/2,rect.height/2);

            setTimeout(() =>{
                if(gameState.tapsLeft > 0){
                setCircleImage("Chest/1/Chest1_1.png");
        }},100)
        }
    },[])

     const endTapSeries =  useCallback(() =>{
        if(tapCircleRef.current) {
            setCircleImage("Chest/1/Chest1_3.png");

            const rect = tapCircleRef.current.getBoundingClinetRect();
            particleSystemRef.current.createParticle(rect.width/2,rect.height/2);

            setTimeout(() =>resetTapSeries(),3000);
        }
     },[] )

     const resetTapSeries = useCallback(() =>{
        gameState.tapsLeft = Game_Config.initialTaps;
        gameState.sessiontapCount = 0;

        setCircleImage(" Chest/1/Chest1_1.png");
        setTapsLeft(gameState.tapsLeft);

        gameState.saveState();
     }, [])


     const handleTap = useCallback(() =>{
        if(gameState.tapsLeft <= 0 || gameState.dailyTapCount <= 0 ) return;

        const {tapMultiplier , getMultiplier} = boostManager.getMultipliers();
        const baseTap =1;
        const effectiveTaps = Math.min( gameState.tapsLeft, baseTap *tapMultiplier);

        if(gameState.tapsLeft >= 1 && gameState.dailyTapCount >= 1){
            gameState.tapsLeft -= effectiveTaps;
            gameState.sessiontapCount += effectiveTaps;
            gameState.dailyTapCount = Math.max(0,gameState.dailyTapCount - baseTap);

            const gemsEarned = Game_Config.gemsPerTap * effectiveTaps * getMultiplier;
            gameState.addGems(gemsEarned)

            gameState.saveDailyTapCount(gameState.dailyTapCount);
            gameState.saveState();

            setTapsLeft(gameState.tapsLeft);
            setDailyTapCount(gameState.dailyTapCount);

            createTapEffects();

            if(gameState.tapsLeft === 0){
                endTapSeries();
            }
        }
     },[])

  return {
    handleTap,
    createTapEffects,
    endTapSeries,
    resetTapSeries,
  };
}  

