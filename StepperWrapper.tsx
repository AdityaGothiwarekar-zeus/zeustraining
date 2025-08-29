import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import _ from "lodash";
import Stepper from "../../../../../components/Stepper/Stepper";
import { getRandomNumberInRange } from "../../../../../utils/CommonHelper";
import { randomNumberGenerator } from "../../../../../utils/CommonHelper";
import { computerAccuracy } from "../../../src/utils/constants";
import { isComputerTurnSelector } from "../redux/redux.selectors";
import { GameFlowEnum } from "../../../src/components/redux/redux.types";
import { CompletionCheckHandlerProps } from "../../utils/types";
import "./Stepper.scss";
import incrementIcon from "../../../media/assets/icons/stepper_increase_icon.svg";
import { getLocaleMessageString } from "../../../../../utils/translations";
import { messageStringsKeys } from "../../utils/constants";

interface StepperWrapperProps {
  min?: number;
  max: number;
  stepAmount?: number;
  values: (number | null)[];
  onChange: (index: number, value: number) => void;
  isSecondStepperEnabled?: boolean;
  isStepperRendered?: boolean;
  computerHasSetValues?: boolean;
  setComputerHasSetValues?: (value: boolean) => void;
  setComputerSecondValue?: (value: number | null) => void;
  completionCheckHandler?: (args: CompletionCheckHandlerProps) => void;
  gameFlow?: GameFlowEnum;
  attempts?: number;
  cubes?: string[];
  currentPlayer?: any;
  slots?: (string | null)[];
  winStatus?: number;
  currentRound?: number;
  setSlots?: React.Dispatch<React.SetStateAction<(string | null)[]>>;
  setWinStatus?: React.Dispatch<React.SetStateAction<number>>;
  dispatch?: any;
  setIsSecondStepperEnabled?: (enabled: boolean) => void;
  computerSecondValue?: number | null;
  setCubes?: React.Dispatch<React.SetStateAction<string[]>>;
  handleRoundEnd?: () => void;
  twoParts?: number[];
}

const StepperWrapper: React.FC<StepperWrapperProps> = ({
  min = 0,
  max,
  stepAmount = 1,
  values,
  onChange,
  isSecondStepperEnabled = true,
  isStepperRendered = false,
  computerHasSetValues = false,
  setComputerHasSetValues,
  setComputerSecondValue,
  completionCheckHandler,
  gameFlow,
  attempts,
  cubes,
  currentPlayer,
  slots,
  winStatus,
  currentRound,
  setSlots,
  setWinStatus,
  dispatch,
  setIsSecondStepperEnabled,
  computerSecondValue,
  setCubes,
  handleRoundEnd,
  twoParts,
}) => {
  const isComputerTurn = useSelector(isComputerTurnSelector);
  
   const gameFlowstate = useSelector((state: any) => state.gameFlow); // current game flow from redux
  const isStepperDisabledGlobal = useSelector((state: any) => state.isStepperDisabled);

  // local state to manage disabled state
  const [isStepperDisabled, setIsStepperDisabled] = useState(false);
  const getComputerChoice = (gameFlow: GameFlowEnum, twoParts?: number[]) => {
    const isOptimalTurn = randomNumberGenerator() < computerAccuracy;
    
    let a: number, b: number, c: number;

    if (gameFlow === GameFlowEnum.makeExpression) {
      if (isOptimalTurn && twoParts) {
        a = twoParts[0];
        c = 20;
        b = c - a;
      } else {
        a = getRandomNumberInRange(0, max);
        c = getRandomNumberInRange(0, max);
        if (twoParts && a === twoParts[0] && c === 20) {
          c = c === max ? c - 1 : c + 1;
        }
        b = c - a;
      }
    } else if (gameFlow === GameFlowEnum.makeFullExpression) {
      if (isOptimalTurn && twoParts) {
        a = getRandomNumberInRange(0, max);
        b = twoParts[1];
        c = a + b;
      } else {
        a = getRandomNumberInRange(0, max);
        const possibleBValues = _.range(0, max + 1).filter(num => 
          !twoParts || num !== twoParts[1]
        );
        b = _.sample(possibleBValues) ?? getRandomNumberInRange(0, max);
        c = a + b;
      }
    } else {
      if (isOptimalTurn) {
        a = getRandomNumberInRange(0, max);
        b = getRandomNumberInRange(0, max - a);
        c = a + b;
      } else {
        a = getRandomNumberInRange(0, max);
        b = getRandomNumberInRange(0, max);
        c = getRandomNumberInRange(0, max);
        if (c === a + b) c = (c + 1) % (max + 1);
      }
    }

    console.log("Computer choice - isOptimalTurn:", isOptimalTurn, { a, b, c });
    return { a, b, c, isOptimalTurn };
  };

  useEffect(() => {
    if (isComputerTurn && isStepperRendered && !computerHasSetValues && setComputerHasSetValues && setComputerSecondValue && setSlots) {
      console.log("Computer turn started, resetting slots");
      setSlots(Array(3).fill(null));
      setComputerSecondValue(null);

      const timer = setTimeout(() => {
        const { a, b, c, isOptimalTurn } = getComputerChoice(gameFlow || GameFlowEnum.makeExpression, twoParts);

        console.log("Computer strategy:", {
          gameFlow,
          isOptimalTurn,
          values: { a, b, c },
          expectedAnswer: twoParts
        });

        setComputerSecondValue(b);
        setComputerHasSetValues(true);

        const newSlots = Array(3).fill(null);
        
        if (gameFlow === GameFlowEnum.makeExpression) {
          newSlots[0] = a.toString();
          newSlots[2] = c.toString();
        } else if (gameFlow === GameFlowEnum.makeFullExpression) {
          newSlots[1] = b.toString();
        } else {
          newSlots[0] = a.toString();
          newSlots[2] = c.toString();
        }

        console.log("Setting initial slots:", newSlots);
        setSlots(newSlots);

        setTimeout(() => {
          if (completionCheckHandler && gameFlow) {
            completionCheckHandler({
              gameFlow,
              twoParts: twoParts || [a, c - a],
              attempts: attempts || 0,
              cubes: cubes || [],
              currentPlayer: currentPlayer || "",
              slots: newSlots,
              winStatus: winStatus || 0,
              currentRound: currentRound || 0,
              setSlots,
              setWinStatus: setWinStatus || (() => {}),
              dispatch: dispatch || (() => {}),
              isComputerTurn,
              isSecondStepperEnabled: gameFlow !== GameFlowEnum.makeFullExpression,
              setIsSecondStepperEnabled: setIsSecondStepperEnabled || (() => {}),
              computerSecondValue: b,
              setCubes: setCubes || (() => {}),
              handleRoundEnd: handleRoundEnd || (() => {}),
            });
          }

          if (gameFlow === GameFlowEnum.makeFullExpression) {
            if (setIsSecondStepperEnabled) {
              setIsSecondStepperEnabled(true);
            }
            return;
          }

          setTimeout(() => {
            const finalSlots = [...newSlots];
            finalSlots[1] = b.toString();

            console.log("Setting final slots (all steppers):", finalSlots);
            setSlots(finalSlots);

            if (setIsSecondStepperEnabled) {
              setIsSecondStepperEnabled(true);
            }

            setTimeout(() => {
              if (completionCheckHandler && gameFlow) {
                completionCheckHandler({
                  gameFlow,
                  twoParts: twoParts || [a, c - a],
                  attempts: attempts || 0,
                  cubes: cubes || [],
                  currentPlayer: currentPlayer || "",
                  slots: finalSlots,
                  winStatus: winStatus || 0,
                  currentRound: currentRound || 0,
                  setSlots,
                  setWinStatus: setWinStatus || (() => {}),
                  dispatch: dispatch || (() => {}),
                  isComputerTurn,
                  isSecondStepperEnabled: true,
                  setIsSecondStepperEnabled: setIsSecondStepperEnabled || (() => {}),
                  computerSecondValue: b,
                  setCubes: setCubes || (() => {}),
                  handleRoundEnd: handleRoundEnd || (() => {}),
                });
              }
            }, 1000);
          }, 2000);
        }, 2000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isComputerTurn, isStepperRendered, computerHasSetValues, gameFlow, twoParts]);

  useEffect(() => {
    // If redux flag itself says disable → disable
    if (isStepperDisabledGlobal) {
      setIsStepperDisabled(true);
      return;
    }

    // otherwise disable only for GenerateTower
    if (gameFlowstate === GameFlowEnum.generateTower) {
      setIsStepperDisabled(true);
    } else {
      setIsStepperDisabled(false);
    }
  }, [gameFlow, isStepperDisabledGlobal]);

 return (
    <div className="stepper-wrapper">
      {/* Stepper 1 */}
      <div className="stepper-container">
        <Stepper
          key={`stepper-1-${values[0]}`}
          stepperData={{
            min,
            max,
            stepAmount,
            initialValue: values[0] ?? 0,
          }}
          getValueCallBack={(val) => onChange(0, val)}
          inputFieldLabel="stepper-1"
          isIntOnly
          showZeroAsBlank
          disableInput={isStepperDisabled}
          disableIncrement={isStepperDisabled}
          disableDecrement={isStepperDisabled}
          increment={{
            icon: <img src={incrementIcon} draggable={false} alt="increase" />,
            cssClass: `increase`,
            tooltip: getLocaleMessageString(messageStringsKeys().increase),
            ariaLabel: getLocaleMessageString(messageStringsKeys().increaseNum),
          }}
          decrement={{
            icon: <img src={incrementIcon} draggable={false} alt="decrease" />,
            cssClass: `decrease`,
            tooltip: getLocaleMessageString(messageStringsKeys().decrease),
            ariaLabel: getLocaleMessageString(messageStringsKeys().decreaseNum),
          }}
        />
      </div>

      <span className="stepper-operator">+</span>

      {/* Stepper 2 */}
      <div className="stepper-container">
        <Stepper
          key={`stepper-2-${values[1]}`}
          stepperData={{
            min,
            max,
            stepAmount,
            initialValue: values[1] ?? 0,
          }}
          getValueCallBack={(val) => onChange(1, val)}
          inputFieldLabel="stepper-2"
          isIntOnly
          showZeroAsBlank
           disableInput={!isSecondStepperEnabled}
          disableIncrement={!isSecondStepperEnabled}
          disableDecrement={!isSecondStepperEnabled}
          increment={{
            icon: <img src={incrementIcon} draggable={false} alt="increase" />,
            cssClass: `increase`,
            tooltip: getLocaleMessageString(messageStringsKeys().increase),
            ariaLabel: getLocaleMessageString(messageStringsKeys().increaseNum),
          }}
          decrement={{
            icon: <img src={incrementIcon} draggable={false} alt="decrease" />,
            cssClass: `decrease`,
            tooltip: getLocaleMessageString(messageStringsKeys().decrease),
            ariaLabel: getLocaleMessageString(messageStringsKeys().decreaseNum),
          }}
        />
      </div>

      <span className="stepper-operator">=</span>

      {/* Stepper 3 */}
      <div className="stepper-container">
        <Stepper
          key={`stepper-3-${values[2]}`}
          stepperData={{
            min,
            max,
            stepAmount,
            initialValue: values[2] ?? 0,
          }}
          getValueCallBack={(val) => onChange(2, val)}
          inputFieldLabel="stepper-3"
          isIntOnly
          showZeroAsBlank
          disableInput={isStepperDisabled}
          disableIncrement={isStepperDisabled}
          disableDecrement={isStepperDisabled}
          increment={{
            icon: <img src={incrementIcon} draggable={false} alt="increase" />,
            cssClass: `increase`,
            tooltip: getLocaleMessageString(messageStringsKeys().increase),
            ariaLabel: getLocaleMessageString(messageStringsKeys().increaseNum),
          }}
          decrement={{
            icon: <img src={incrementIcon} draggable={false} alt="decrease" />,
            cssClass: `decrease`,
            tooltip: getLocaleMessageString(messageStringsKeys().decrease),
            ariaLabel: getLocaleMessageString(messageStringsKeys().decreaseNum),
          }}
        />
      </div>
    </div>
  );
};

export default StepperWrapper;