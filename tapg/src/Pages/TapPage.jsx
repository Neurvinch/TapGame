import { useGameState } from "../Context/GameStateProvider"

import  {TapManger} from '../Hooks/TapManager'

const TapPage = () => {

    const { handleTap,
        createTapEffects,
        endTapSeries,
        resetTapSeries,} = TapManger();

        const {tapsLeft ,totalGems ,
            dailyTapLimit,dailyTapCount ,
            sessionTapCount ,resetGame,

        } = useGameState();
  return (
    <div>
        <h1>Tap Page</h1>
        <p>Tap Left : {tapsLeft}</p>
        <p> Total Gems : {totalGems}</p>
        <p> Daily Tap Limit : {dailyTapLimit}</p>
        <p> Daily Tap Count : {dailyTapCount}</p>
        <p> Session Tap Count : {sessionTapCount}</p>
        <button onClick={handleTap}>Tap</button>
        <button onClick={resetGame}>Reset Game</button>

    </div>
  )
}

export default TapPage