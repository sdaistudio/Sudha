import { Capabilities } from './components/Capabilities'
import { Closing, Footer } from './components/Closing'
import { DemoProvider } from './components/DemoContext'
import { DesktopCompanion } from './components/DesktopCompanion'
import { DemoWorkspace } from './components/demo/DemoWorkspace'
import { Hero } from './components/Hero'
import { Horizons } from './components/Horizons'
import { Meet } from './components/Meet'
import { Nav } from './components/Nav'
import { Roadmap } from './components/Roadmap'
import { Scorecard, Trust } from './components/Trust'
import { Workday } from './components/Workday'

function Page() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Meet />
        <Horizons />
        <Capabilities />
        <DemoWorkspace />
        <Workday />
        <DesktopCompanion />
        <Roadmap />
        <Trust />
        <Scorecard />
        <Closing />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <DemoProvider>
      <Page />
    </DemoProvider>
  )
}
