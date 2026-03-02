import * as fc from 'fast-check'

/**
 * Arbitrary for valid latitude values (-90 to 90)
 */
export const latitude = () => fc.double({ min: -90, max: 90 })

/**
 * Arbitrary for valid longitude values (-180 to 180)
 */
export const longitude = () => fc.double({ min: -180, max: 180 })

/**
 * Arbitrary for valid geographic coordinates
 */
export const coordinates = () =>
  fc.record({
    latitude: latitude(),
    longitude: longitude(),
  })

/**
 * Arbitrary for visual magnitude values (typically -1.5 to 6.5 for visible stars)
 */
export const visualMagnitude = () => fc.double({ min: -1.5, max: 6.5 })

/**
 * Arbitrary for zoom levels (0.5x to 5x)
 */
export const zoomLevel = () => fc.double({ min: 0.5, max: 5.0 })

/**
 * Arbitrary for valid timestamps
 */
export const timestamp = () => fc.date({ min: new Date(2000, 0, 1), max: new Date(2100, 0, 1) })

/**
 * Arbitrary for constellation names
 */
export const constellationName = () =>
  fc.constantFrom(
    'Orion',
    'Ursa Major',
    'Cassiopeia',
    'Andromeda',
    'Perseus',
    'Cygnus',
    'Lyra',
    'Aquila',
    'Scorpius',
    'Sagittarius'
  )

/**
 * Arbitrary for star names
 */
export const starName = () =>
  fc.constantFrom(
    'Sirius',
    'Betelgeuse',
    'Rigel',
    'Vega',
    'Altair',
    'Deneb',
    'Polaris',
    'Antares',
    'Aldebaran',
    'Spica'
  )

/**
 * Arbitrary for spectral types
 */
export const spectralType = () => fc.constantFrom('O', 'B', 'A', 'F', 'G', 'K', 'M')

/**
 * Arbitrary for temperature in Kelvin (stellar range)
 */
export const stellarTemperature = () => fc.integer({ min: 2000, max: 50000 })

/**
 * Arbitrary for distance in light-years
 */
export const distanceInLightYears = () => fc.double({ min: 0.1, max: 10000 })
