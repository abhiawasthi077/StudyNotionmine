
// Icons Import
import React from 'react'
import {Link} from "react-router-dom" 
// Icons Import
import {AiOutlineArrowRight} from "react-icons/ai"
// Image and Video Import
import Banner from "../assets/Images/banner.mp4"
// Component Imports
import HighlightText from '../components/core/HomePage/HighLightText'
import CTAButton from '../components/core/HomePage/Button'
import CodeBlocks from '../components/core/HomePage/CodeBlocks'
import TimelineSection from '../components/core/HomePage/TimeLineSection'
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import ExploreMore from '../components/core/HomePage/ExploreMore'
import Footer from '../components/common/Footer'
import ReviewSlider from '../components/common/ReviewSlider'


const Home = () => {
  return (
    <div>
    {/*Section1*/}

    <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between'>
        {/* Become a Instructor Button */}
         <Link to={"/signup"}>
         <div className="group mx-auto mt-10 w-fit rounded-full bg-richblack-800 p-1 font-bold text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-95 hover:drop-shadow-none">
            <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900">
                <p>Become an Instructor / Start Learning</p>
                <AiOutlineArrowRight/>
              </div>
            </div>
         </Link>
        {/* Empower Heading */}
         <div className='text-center text-4xl font-semibold mt-7'>
          Empower Your Future with 
          <HighlightText text={"Coding Skills"} />
         </div>

        {/* Sub Heading */}
         <div className='mt-4 w-[90%] text-center text-lg font-bold text-richblack-300'>
         With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on projects, quizzes, and personalized feedback from instructors.
         </div>

        {/* CTA Buttons */}
        <div className='flex flex-row gap-7 mt-8'>
         <CTAButton active={true} linkto={"/cat"}>
          Learn Something New
         </CTAButton>
         <CTAButton active={false} linkto={"/login"}>
          Dashboard
         </CTAButton>
        </div>

         {/* Video */}
         <div className="mt-16 mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200">
          <video className="shadow-[20px_20px_rgba(255,255,255)]" muted loop autoPlay src={Banner}></video>
         </div>

        {/* Code Section 1  */}
         <div>
           <CodeBlocks
            position={"lg:flex-row"}
            heading={
              <div className='text-4xl font-semibold'>
                Unlock your 
                <HighlightText text={"Coding potential "}/>
                with our online courses
              </div>
            }
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={
              {
                btnText: "Try it yourself", 
                linkto: '/login',
                active: true,
              }
            }

            ctabtn2={
              {
                btnText: "Learn Something New", 
                linkto: '/cat',
                active: false,
              }
            }
            codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            codeColor={"text-yellow-25"}
            backgroundGradient={<div className="codeblock1 absolute"></div>}
           />
         </div>

         <div>

          {/* Code Section 2 */}
           <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className='text-4xl font-semibold lg:w-[50%]'>
                Start
                <HighlightText text={"Coding in seconds"}/>
              </div>
            }
            subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={
              {
                btnText: "Try it yourself", 
                linkto: '/signup',
                active: true,
              }
            }

            ctabtn2={
              {
                btnText: "Learn Something New", 
                linkto: '/login',
                active: false,
              }
            }
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
            codeColor={"text-white"}
           />
         </div>
         <ExploreMore/>
    </div>


    {/*Section2*/}

    <div className='bg-pure-greys-5 text-richblack-700'>
            <div className='homepage_bg h-[310px]'>
              {/* Explore Full Catagory Section */}
                <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
                    <div></div>
                    <div className='flex flex-row gap-7 text-white lg:mt-44'>
                        <CTAButton active={true} linkto={'/cat'}>
                            <div className='flex items-center gap-2' >
                                Explore Full Catalog
                                <AiOutlineArrowRight />
                            </div>
                            
                        </CTAButton>
                        <CTAButton active={false} linkto={"/about"}>
                            <div>
                                About Us
                            </div>
                        </CTAButton>
                    </div>

                </div>


            </div>

            <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>

<div className="mb-10 mt-[-100px] flex flex-col justify-between gap-7 lg:mt-20 lg:flex-row lg:gap-0">
    <div className='text-4xl font-semibold lg:w-[45%]'>
        Get the Skills you need for a{" "}
        <HighlightText text={"Job that is in demand"} />
    </div>

    <div className='flex flex-col gap-10 lg:w-[40%] items-start'>
    <div className='text-[16px]'>
    The modern StudyNotion is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
    </div>
    <CTAButton active={true} linkto={"/contact"}>
        <div>
            Contact Us
        </div>
    </CTAButton>
    </div>

</div>



<TimelineSection />

<LearningLanguageSection />

</div>

</div>
    
    {/*Section3*/}

    <div className="relative mx-auto my-20 max-w-maxContent w-11/12 flex-col items-center justify-between gap-8 bg-richblack-900 text-white">

            <InstructorSection />

            <h2 className='text-center text-4xl font-semibold mt-14'>Reviews from Other Learners</h2>
            <div className='flex flex-col justify-between'>
            <ReviewSlider/>
            </div>
            
      </div>

    {/*Section4*/}
    <Footer/>
    
    </div>
  )
}

export default Home