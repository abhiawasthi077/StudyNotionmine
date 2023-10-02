import React from 'react'
import HighLightText from '../HomePage/HighLightText'
import know_your_progress from "../../../assets/Images/Know_your_progress.png"
import coompare_with_others from "../../../assets/Images/Compare_with_others.png"
import plan_your_lesson from "../../../assets/Images/Plan_your_lessons.png"
import CTAButton from "../HomePage/Button"
const LearningLanguageSection = () => {
  return (
    <div className='m-[140px]'>
      <div className='flex flex-col gap-5 items-center '>

        <div className='text-4xl font-semibold text-center'>
          Your Swiss Knife for
          <HighLightText text={"learning any language"}/>
        </div>

        <div className='text-center text-richblack-600 mx-auto text-base font-medium w-[70%]'>
          Using spin making learning multiple languages easy.With 20+ languages  realistic voice-over, progress tracking,custom
          schedule and more.
        </div>

        <div className='flex flex-row items-center justify-center mt-5 ml-10'>
          <img
            src={know_your_progress}
            alt='KnowYourProgress'
            className='object-contain -mr-32'
          />
          <img
            src={coompare_with_others}
            alt='CompareWithOthers'
            className='object-contain'
          />
          <img
            src={plan_your_lesson}
            alt='PlanYourLesson'
            className='object-contain -ml-36'
          />
        </div>

        <div className='w-fit'>
          <CTAButton active={true} linkto={"/signup"}>
            <div>
              Learn More
            </div>
          </CTAButton>
        </div>

      </div>
    </div>
  )
}

export default LearningLanguageSection