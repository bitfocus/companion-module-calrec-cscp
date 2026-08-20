/** Tuning values shared across the module. Timings are milliseconds unless named otherwise. */

/** Used when the user has not set a fader limit; also the maximum the config field allows. */
export const DEFAULT_MAX_FADER_COUNT = 128
/** Highest fader id a button may address, independent of what any one console reports. */
export const MAX_ADDRESSABLE_FADER_COUNT = 256
/** The protocol defines 16 main buses; there is no config field for this. */
export const MAX_MAIN_COUNT = 16

/** Protocol level range for every fader (see the conversion table in the protocol appendix). */
export const MIN_PROTOCOL_LEVEL = 0
export const MAX_PROTOCOL_LEVEL = 1023

/** Channel/group/VCA faders span -100 dB to +10 dB. */
export const CHANNEL_FADER_MIN_DB = -100
export const CHANNEL_FADER_MAX_DB = 10

/** Shown until the desk pushes a PFL change, since PFL cannot be read back. */
export const PFL_UNKNOWN = 'Unknown'

/** Ignore inbound echoes briefly after the last outbound level write. */
export const FADER_LEVEL_SETTLE_MS = 150
/** Per-command response timeout for library reads (heartbeat, rare one-shots). */
export const COMMAND_RESPONSE_TIMEOUT_MS = 2000
/** Library default is 100ms — too slow for encoder bursts. */
export const FADER_LEVEL_RATE_MS = 25
/**
 * How often an idle link is probed. A network outage never closes the socket, so
 * without this the module keeps reporting Ok after the console is gone.
 */
export const HEARTBEAT_INTERVAL_MS = 2000
/** Detection takes interval × (misses + 1), so two misses ≈ 6s worst case. */
export const HEARTBEAT_MAX_MISSES = 2
/** Snap displayed dB to Companion's intended value when the console echo is this close. */
export const DB_DISPLAY_SNAP_DB = 0.15

/**
 * On connect the desk floods unsolicited fader state. Ready sync waits until that
 * burst has been quiet for this long instead of re-reading every fader.
 */
export const INITIAL_FLOOD_QUIET_MS = 400
/** Cap how long we wait for the connect flood before proceeding with what we have. */
export const INITIAL_FLOOD_MAX_MS = 5000
/** How often the connect flood is sampled for quiet. */
export const INITIAL_FLOOD_POLL_MS = 50
