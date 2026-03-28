var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/prompt.js
var KIDS_ENVIRONMENTS = {
  Terratrope: "Soft warm earth background \u2014 gentle round hills and smooth rocks, warm golden light, light puffs of dusty clouds. Muted mineral tones, sage greens, warm stone grays. Calm and grounded.",
  Aquatrope: "Soft ocean background \u2014 gentle teal-blue water with smooth rolling waves, sparkling droplets, cool aqua shimmer. Peaceful and watery.",
  Aerotrope: "Soft sky background \u2014 bright cyan fading to pale turquoise, big fluffy clouds, gentle wind swirls. Open, bright, and airy.",
  Pyrotrope: "Soft warm background \u2014 golden-orange horizon glow, smooth warm clouds, tiny floating embers. Warm and cozy, not hot or scary.",
  Floratrope: "Soft forest background \u2014 gentle green canopy light, curling vines, round mushrooms at edges, tiny glowing pollen dots. Lush and magical.",
  Prismatrope: "Soft crystal background \u2014 gentle turquoise glow, smooth crystal shapes catching rainbow light, soft prismatic beams. Sparkling and wondrous."
};
var TWEEN_ENVIRONMENTS = {
  Terratrope: "Environmentally reflective rocky upland habitat focused on the immediate foreground: weathered boulders, fractured earth, sparse moss, muted mineral tones. Creature positioned on a slightly raised rock ledge. No wide scenic vista, no distant mountains or detailed horizon. Background softly blurred and understated \u2014 darker and more muted than the creature so its form and colors pop clearly. Shallow grounded depth of field. Background should feel ancient, heavy, and stone-born.",
  Aquatrope: "Environmentally reflective tidal-pool / estuary habitat focused on the immediate foreground: slick rocks, shallow rippled water around the creature's limbs, a few reeds or algae clusters. Creature positioned low in shallow water or on wet stone. No wide river scene, no distant hills or open water. Any distant background softly blurred and understated \u2014 darker and more muted than the creature. Background should feel patient, predatory, and amphibious.",
  Aerotrope: "Environmentally reflective windswept cliffside habitat focused on the immediate foreground: jagged stone perch beneath the creature, subtle airborne grit or feather-light debris. Creature perched on a rocky ledge or cliff lip. No wide open sky or sweeping cloudscapes. Background is tight dark storm-cloud atmosphere behind the creature \u2014 darker and more muted so the creature pops. Background should feel elevated, exposed, and aerodynamic.",
  Pyrotrope: "Environmentally reflective volcanic habitat focused on the immediate foreground: cracked basalt slab, ash-dusted ground, faint heat shimmer. Creature crouched on dark volcanic rock. No wide lava landscape or dramatic eruptions. Background is dark smoky haze \u2014 darker and more muted than the creature. Restrained fissure glow only in immediate ground cracks. Background should feel geothermally active, harsh, and pressurized rather than chaotic.",
  Floratrope: "Environmentally reflective old-growth forest habitat focused on the immediate foreground: mossy earth, gnarled roots, leaf litter, shelf fungi, ferns at the creature's feet. Creature standing on forest floor. No wide forest panorama or detailed canopy. Background is dark dense foliage \u2014 darker and more muted than the creature, with softly filtered light. Background should feel ancient, dense, and alive.",
  Prismatrope: "Environmentally reflective mineral-rich geologic habitat focused on the immediate foreground: streaked stone, exposed crystal seams, fractured deposits around the creature. Creature positioned on a mineral ledge. No wide cave panorama or dramatic crystal cavern. Background is dark geological interior \u2014 darker and more muted than the creature, with restrained prismatic edge refractions only. Background should feel rare, geological, and quietly luminous."
};
function kidsAbundant(creature, colors, patterning, env2) {
  return `A single small fantastical creature in a soft trope-specific environment. ${env2} The entire creature must be fully visible within the frame with generous space on all sides \u2014 no cropping, no cutoff. Painted creature illustration \u2014 detailed with visible artistic painted quality, warm and charming but with real texture and material definition. NOT photorealistic, NOT hyper-detailed, NOT glossy plastic, NOT 3D rendering, NOT colored pencil. Polished and controlled with painterly warmth.

THREE-DIMENSIONAL FORM: Strong three-dimensional volume with a naturally creature-appropriate silhouette \u2014 readable head, body, and limbs or fins. Compact and softly rounded with gentle curves and clear separation between head and body. NOT a ball, NOT compressed into a sphere.

CREATURE: ${creature}

FRAMING: Centered with comfortable space on all sides. Full body visible from nose to tail/fin tips. Soft contact shadow on the ground.

PROPORTIONS: Large rounded head about 45-50% of body mass, small body, short limbs/fins, slightly oversized features. Relaxed pose \u2014 clearly a Standard/common kid-tier creature.

EYES: Very large, glossy, round. Deep black pupils, warm amber-brown gradient irises. Calm, curious, friendly \u2014 NOT scary, NOT predatory.

MATERIAL: Species-appropriate, rendered softly. Fur: fine directional strands. Scales: smooth with subtle bumps. Feathers: soft clustered groups. Fins: semi-translucent with gentle veins. No sharp spikes, no hard armor \u2014 everything softened and huggable.

PATTERNING: ${patterning || "Minimal \u2014 soft spots, simple banding, or light mottling, inspired by real animals but simplified."}

COLOR SYSTEM: ${colors || "Soft, natural, slightly muted with warm overall feel."} NOT vivid neon. One or two accent colors only.

LIGHTING: Soft warm light from top-left. Gentle highlight on upper surfaces. Small fuzzy contact shadow. No dramatic rim light.

Must feel three-dimensional, touchable, collectible \u2014 a beautiful but approachable Standard creature.`;
}
__name(kidsAbundant, "kidsAbundant");
function kidsEndemic(creature, colors, patterning, env2) {
  return `A single small fantastical creature in a soft trope-specific environment. ${env2} The entire creature must be fully visible \u2014 no cropping. Premium painted creature illustration with RICH, LUMINOUS quality. Saturated colors, beautiful lighting, painterly depth. NOT flat, NOT dull. LUMINOUS, RICH, ALIVE.

THREE-DIMENSIONAL FORM: Strong volume, compact and softly rounded. Clear head/body separation. NOT a ball.

CREATURE: ${creature}

FRAMING: Centered. Full body visible. Soft contact shadow.

PROPORTIONS: Large rounded head ~45-50% of body mass. ENDEMIC rarity \u2014 clearly richer than Abundant. ONE defining biological feature visible and beautiful.

EYES: Oversized, glossy, luminous. Deep black pupil, warm amber-gold gradient iris. Calm, curious, friendly \u2014 a sense of wonder.

MATERIAL: Rich painted texture \u2014 individual scales, fur strands, skin grain with depth and luminosity. Defining feature (crystal, mushroom, coral) must feel GROWN from body, not attached. No jewelry, no armor.

PATTERNING: ${patterning || "Structured-organic \u2014 asymmetrical clustering, soft banding, blotches, or rosettes. Biologically plausible."}

COLOR SYSTEM: ${colors || "Enhanced saturation, 3-4 dominant tones."} Fantasy color from secondary material only. Fur stays earth-toned.

LIGHTING: Beautiful warm lighting with soft glowing highlights. Subtle iridescence on the defining feature.

Must look like PREMIUM FANTASY CARD ART \u2014 luminous, rich, atmospheric. Clearly richer than Abundant.`;
}
__name(kidsEndemic, "kidsEndemic");
function kidsHolotype(creature, colors, patterning, env2) {
  return `A single small fantastical creature in a soft trope-specific environment. ${env2} The entire creature must be fully visible \u2014 no cropping. Premium fantasy trading card art \u2014 RICH, LUMINOUS, ATMOSPHERIC. Rich saturated colors, dramatic lighting, painterly depth. EXCEPTIONAL detail. NOT flat, NOT dull. LUMINOUS, RICH, ALIVE.

THREE-DIMENSIONAL FORM: Strong volume, anatomically believable. More complex anatomy than lower tiers \u2014 multiple animal influences visible and cohesive.

CREATURE: ${creature}

FRAMING: Centered. Full body visible. Soft contact shadow.

PROPORTIONS: Large expressive head ~45-50% of body mass. HOLOTYPE rarity \u2014 the rarest, most spectacular specimen. Every surface tells a story.

EYES: Large, glossy, luminous. Deep black pupil, warm amber-gold gradient iris. Calm intelligence, awareness, and dignity.

MATERIAL: EXCEPTIONAL texture \u2014 every scale, strand, fin ray individually rendered. Materials MERGE: fur-to-scale transitions, skin-to-mineral veining. All features grown and biologically integrated.

PATTERNING: ${patterning || "Bold real-animal-kingdom patterns. 30-40% clean rest space between bold markings."}

COLOR SYSTEM: ${colors || "Peak natural richness. Rich, striking, saturated."} Fur stays earth-toned. Richness from pattern complexity and secondary materials.

LIGHTING: Rich dramatic lighting with luminous highlights. Every material catches light differently.

This must look like PREMIUM FANTASY CARD ART \u2014 the crown jewel of the bestiary. Luminous, rich, atmospheric, breathtaking.`;
}
__name(kidsHolotype, "kidsHolotype");
function tweenAbundant(creature, eyes, colors, patterning, env2, name) {
  return `Create a 1024x1536 portrait image. The artwork fills the entire canvas edge to edge like a trading card illustration. Single creature, no text and no card frame. Full-body view: the creature must be completely visible from head to tail with all limbs, wings, horns, and tail tips fully inside the frame. No cropping anywhere. Medium-wide distance, three-quarter or side-on pose, not an extreme close-up. The creature should occupy roughly 60-70% of the frame, with the remaining 30-40% showing the surrounding environment as a soft, secondary backdrop. Semi-realistic fantasy creature in natural painterly illustration style with soft detail control and grounded anatomy.

${env2}

CREATURE: ${creature}

Eyes ${eyes || "slightly enlarged (~1.2x) with sharp gloss, intense amber reflections, heavy upper eyelid, narrowed slit pupils \u2014 piercing, watchful, predatory"}.

Color palette: ${colors || "stone grays, muted blues, soft earth tones"}. MUTED NATURAL EARTH TONES only. No vivid, candy, neon, or fantasy colors.

Patterning: ${patterning || "minimal \u2014 faint mottling, soft transitions, subtle scarring"}.

CONSTRAINTS: Nothing emits light \u2014 no glow, no luminescence. Territorial predatory expression. Grounded real-animal anatomy only. No xenobiology, no extra eyes, no alien features. Lighting soft and diffused.

Full body visible. ${name}.`;
}
__name(tweenAbundant, "tweenAbundant");
function tweenEndemic(creature, eyes, colors, patterning, env2, name) {
  return `Create a 1024x1536 portrait image. The artwork fills the entire canvas edge to edge like a trading card illustration. Single creature, no text and no card frame. Full-body view: the creature must be completely visible from head to tail with all limbs, wings, horns, and tail tips fully inside the frame. No cropping anywhere. Medium-wide distance, three-quarter or side-on pose, not an extreme close-up. The creature should occupy roughly 60-70% of the frame, with the remaining 30-40% showing the surrounding environment as a soft, secondary backdrop. Semi-realistic fantasy creature in natural painterly illustration style with soft detail control and grounded anatomy.

${env2}

CREATURE: ${creature} NOTABLE TIER \u2014 a mature alpha displaying peak natural coloration.

Eyes ${eyes || "slightly enlarged (~1.2x) with sharp gloss, intense coloring \u2014 locked on target, fierce, territorial"}.

Color palette: ${colors || "vivid natural animal coloring"}. VIVID but BIOLOGICALLY BELIEVABLE \u2014 think mandarin fish, fire salamander, golden eagle. Richness from biology, not magic.

Patterning: ${patterning || "bold real-world animal patterning \u2014 banding, rosettes, countershading, or warning coloration"}. Horns/spines ~20% larger than standard.

CONSTRAINTS: Nothing emits light \u2014 no glow, no luminescence. Richness comes from BIOLOGY only. Territorial predatory expression. Grounded real-animal anatomy. No xenobiology. Lighting soft.

Full body visible. ${name}.`;
}
__name(tweenEndemic, "tweenEndemic");
function tweenHolotype(creature, eyes, colors, patterning, env2, name) {
  return `Create a 1024x1536 portrait image. The artwork fills the entire canvas edge to edge like a trading card illustration. Single creature, no text and no card frame. Full-body view: the creature must be completely visible from head to tail with all limbs, wings, horns, and tail tips fully inside the frame. No cropping anywhere. Medium-wide distance, three-quarter or side-on pose, not an extreme close-up. The creature should occupy roughly 60-70% of the frame, with the remaining 30-40% showing the surrounding environment as a soft, secondary backdrop. Semi-realistic fantasy creature in natural painterly illustration style with soft detail control and grounded anatomy.

${env2}

CREATURE: ${creature} EXCEPTIONAL TIER \u2014 the apex specimen, a once-in-a-generation alpha. Build is NOTICEABLY MORE ROBUST \u2014 thicker limbs, broader chest, heavier skull, wider stance.

Eyes ${eyes || "LARGER and more expressive (~1.4x natural) \u2014 deep warm amber with rich golden ring, carrying intelligence and wisdom alongside power"}.

Color palette: ${colors || "peak natural richness \u2014 rich, striking, defined"}. DEFINED REAL-WORLD PATTERNING at peak. Fur restricted to white/blonde/brown/red-brown/black.

Patterning: ${patterning || "defined real-world patterning \u2014 hexagonal tessellation, precise rosettes, banded coloration"}. 30-40% clean rest space between bold markings. Peak naturalist detail.

CONSTRAINTS: Nothing emits light \u2014 no glow, no luminescence. Eyes carry intelligence and wisdom alongside power. Every surface tells a story of age and dominance. Grounded real-animal anatomy. No xenobiology. Lighting soft, diffused.

Full body visible. ${name}.`;
}
__name(tweenHolotype, "tweenHolotype");
function buildCreaturePrompt({
  morphologyName = "Unknown Creature",
  creatureDescription = "",
  creatureName = "",
  origen = "Resogen",
  trope = "Terratrope",
  rarity = "Abundant",
  cardStyle = "tween",
  kidsFields = null,
  tweenFields = null,
  // Legacy params kept for compatibility but unused by templates
  threatLevel,
  traits,
  colorPalette,
  season,
  domainOverride,
  element,
  colorPattern,
  framingStyle,
  mutationDesc,
  flavorText,
  stats,
  specimenId,
  timeOfDay,
  colorCloser
}) {
  const displayName = (creatureName || morphologyName || "UNKNOWN").toUpperCase();
  if (cardStyle === "kids") {
    const env3 = KIDS_ENVIRONMENTS[trope] || KIDS_ENVIRONMENTS.Terratrope;
    const k = kidsFields || {};
    const creature2 = k.creature_description || creatureDescription || `A small round ${morphologyName} creature with soft fur and a gentle expression. Compact body, short limbs, sitting calmly.`;
    const colors2 = k.color_palette || "";
    const patterning2 = k.patterning || "";
    if (rarity === "Holotype") return kidsHolotype(creature2, colors2, patterning2, env3);
    if (rarity === "Endemic") return kidsEndemic(creature2, colors2, patterning2, env3);
    return kidsAbundant(creature2, colors2, patterning2, env3);
  }
  const env2 = TWEEN_ENVIRONMENTS[trope] || TWEEN_ENVIRONMENTS.Terratrope;
  const t = tweenFields || {};
  const creature = t.creature_description || creatureDescription || `A massive ${morphologyName} hybrid creature with grounded anatomy. Heavy sturdy body, functional weight-bearing limbs. Territorial pose, direct stare at viewer.`;
  const eyes = t.eyes || "";
  const colors = t.color_palette || "";
  const patterning = t.patterning || "";
  if (rarity === "Holotype") return tweenHolotype(creature, eyes, colors, patterning, env2, displayName);
  if (rarity === "Endemic") return tweenEndemic(creature, eyes, colors, patterning, env2, displayName);
  return tweenAbundant(creature, eyes, colors, patterning, env2, displayName);
}
__name(buildCreaturePrompt, "buildCreaturePrompt");

// src/openai-image.js
var OPENAI_API_BASE = "https://api.openai.com/v1";
async function generateImage(prompt, env2, options = {}) {
  const apiKey = env2.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  const model = options.model || "gpt-image-1.5";
  const size = options.size || "1024x1536";
  const quality = options.quality || "medium";
  const resp = await fetch(`${OPENAI_API_BASE}/images/generations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality
    })
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`OpenAI image generation failed (${resp.status}): ${errBody}`);
  }
  const result = await resp.json();
  const imageData = result.data?.[0];
  if (!imageData) {
    throw new Error("OpenAI returned no image data: " + JSON.stringify(result).slice(0, 200));
  }
  if (imageData.b64_json) {
    const binary = atob(imageData.b64_json);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  if (imageData.url) {
    const imgResp = await fetch(imageData.url);
    if (!imgResp.ok) throw new Error(`Failed to fetch image from OpenAI CDN: ${imgResp.status}`);
    const arrayBuffer = await imgResp.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
  throw new Error("Unexpected OpenAI response format: " + JSON.stringify(imageData).slice(0, 200));
}
__name(generateImage, "generateImage");

// src/storage.js
async function uploadToB2(imageBytes, fileName, contentType = "image/png", env2) {
  const keyId = env2.B2_KEY_ID;
  const appKey = env2.B2_APPLICATION_KEY;
  const bucket = env2.B2_BUCKET_NAME || "aumage-cards";
  const cdnBase = env2.CARDS_CDN_BASE || `https://f005.backblazeb2.com/file/${bucket}`;
  if (!keyId || !appKey) throw new Error("B2 credentials not configured");
  const authString = btoa(`${keyId}:${appKey}`);
  const authResp = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: { Authorization: `Basic ${authString}` }
  });
  if (!authResp.ok) throw new Error(`B2 auth failed: ${authResp.status}`);
  const authData = await authResp.json();
  const apiUrl = authData.apiUrl;
  const authToken = authData.authorizationToken;
  let bucketId = authData.allowed.bucketId;
  if (!bucketId) {
    const listBucketsResp = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ accountId: authData.accountId })
    });
    if (!listBucketsResp.ok) throw new Error(`B2 list buckets failed: ${listBucketsResp.status}`);
    const bucketsData = await listBucketsResp.json();
    const bucketObj = bucketsData.buckets.find((b) => b.bucketName === bucket);
    if (!bucketObj) throw new Error(`Bucket not found: ${bucket}`);
    bucketId = bucketObj.bucketId;
  }
  const uploadUrlResp = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: authToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ bucketId })
  });
  if (!uploadUrlResp.ok) throw new Error(`B2 get upload URL failed: ${uploadUrlResp.status}`);
  const uploadData = await uploadUrlResp.json();
  const sha1 = await computeSha1(imageBytes);
  const uploadResp = await fetch(uploadData.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: uploadData.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(fileName),
      "Content-Type": contentType,
      "Content-Length": imageBytes.length.toString(),
      "X-Bz-Content-Sha1": sha1
    },
    body: imageBytes
  });
  if (!uploadResp.ok) {
    const errText = await uploadResp.text();
    throw new Error(`B2 upload failed: ${uploadResp.status} ${errText}`);
  }
  const publicUrl = `${cdnBase}/${fileName}`;
  return publicUrl;
}
__name(uploadToB2, "uploadToB2");
async function computeSha1(data) {
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(computeSha1, "computeSha1");
function generateCreatureId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "AM-";
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
__name(generateCreatureId, "generateCreatureId");

// src/db.js
function supabaseHeaders(env2) {
  const key = env2.SUPABASE_SERVICE_ROLE_KEY || env2.SUPABASE_SERVICE_KEY;
  return {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
}
__name(supabaseHeaders, "supabaseHeaders");
async function createCreature(env2, data) {
  const url = `${env2.SUPABASE_URL}/rest/v1/creatures`;
  const timestamp = Date.now();
  const catalogId = `CAT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const body = {
    id: data.creature_id || data.id,
    user_id: data.userId || data.user_id,
    image_url: data.image_url || data.creature_url || null,
    video_url: data.video_url || null,
    audio_source: data.audio_source || null,
    audio_storage_path: data.audio_storage_path || null,
    link_url: data.link_url || null,
    fingerprint: data.fingerprint || null,
    seed: data.seed || null,
    mode: data.mode || "creature",
    style: data.style || "realistic",
    features: data.features || {},
    visuals: data.visuals || {},
    prompt_text: data.prompt_text || null,
    is_public: data.is_public !== void 0 ? data.is_public : true,
    folder_id: data.folder_id || null,
    serial_number: data.serial_number,
    catalog_id: catalogId,
    base_rarity: (data.rarity || "common").toLowerCase(),
    ars: data.ars || 0.5,
    trope_class: data.trope,
    morphology: data.morphology,
    tier: data.tier || "1",
    element: data.element || "neutral",
    domain: data.domain || "terrestrial",
    variant_tags: data.variant_tags || { ...data.stats || {}, ...data.traits || {} },
    mint_timestamp: data.mint_timestamp || (/* @__PURE__ */ new Date()).toISOString(),
    residence_region: data.region || "Unknown",
    climate_zone: data.climate || "Temperate",
    season: (data.season || "spring").toLowerCase(),
    hemisphere: data.hemisphere || "northern",
    waveform_hash: data.waveform_hash || `hash-${timestamp}`,
    generation_number: data.generation_number || 0,
    card_url: data.creature_url || data.card_url || "",
    frame_variant: data.frame_variant || "standard",
    annotation_features: data.labels || data.annotation_features || [],
    prompt_hash: data.prompt_hash || `prompt-${timestamp}`,
    creature_name: data.creature_name || null,
    flavor_text: data.flavorText || data.flavor_text || null,
    climate_mastery: data.climate_mastery || null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: supabaseHeaders(env2),
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`[Supabase] Create Failed:`, resp.status, errText);
    throw new Error(`Supabase create creature failed: ${resp.status} ${errText}`);
  }
  const rows = await resp.json();
  return rows[0];
}
__name(createCreature, "createCreature");
async function finalizeCreature(env2, creatureId, data) {
  const url = `${env2.SUPABASE_URL}/rest/v1/creatures?id=eq.${creatureId}`;
  const resp = await fetch(url, {
    method: "PATCH",
    headers: supabaseHeaders(env2),
    body: JSON.stringify(data)
  });
  if (!resp.ok) {
    const err2 = await resp.text();
    throw new Error(`Supabase finalize creature failed: ${resp.status} ${err2}`);
  }
  const rows = await resp.json();
  return rows[0];
}
__name(finalizeCreature, "finalizeCreature");
async function getCreature(env2, id) {
  const url = `${env2.SUPABASE_URL}/rest/v1/creatures?id=eq.${id}&select=*`;
  const resp = await fetch(url, {
    headers: supabaseHeaders(env2)
  });
  if (!resp.ok) {
    const err2 = await resp.text();
    throw new Error(`Supabase get creature failed: ${resp.status} ${err2}`);
  }
  const rows = await resp.json();
  return rows[0] || null;
}
__name(getCreature, "getCreature");

// src/sorting-hat.js
var SYSTEM_PROMPT = `You are the Creature Codex, a naming oracle for Audiotropes \u2014 
creatures born from sound in the Aumage Bestiary. 

Your naming style:
- Pok\xE9mon-style compound names (e.g. "Umbradisc", "Thornveil", "Gloomfin")
- Evocative and cool, not cutesy or romantic
- 1-3 word names maximum
- Suitable for ages 13+
- No human names, no place names, no brand names
- Reflect the creature's element, form, and audio origin

Also write one short flavor text line (8-12 words, present tense, atmospheric).
Format: {"name": "...", "flavor_text": "..."}
Output ONLY the JSON. No other text.`;
var SAFETY_WORDS = [
  "kill",
  "murder",
  "blood",
  "gore",
  "sex",
  "nude",
  "naked",
  "hate",
  "demon",
  "satan",
  "devil",
  "war",
  "weapon",
  "death"
];
async function suggestName(params, env2) {
  const {
    morphologyName,
    audiotropeType,
    rarity,
    traits = [],
    season
  } = params;
  const apiKey = env2.OPENAI_API_KEY;
  if (!apiKey) return { name: "", flavor_text: "" };
  const userPrompt = `Creature: ${morphologyName}-type ${audiotropeType}
Rarity: ${rarity}
Traits: ${traits.join(", ")}
Season: ${season}

Suggest a name and flavor text.`;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 80,
        temperature: 0.9,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!resp.ok) return { name: "", flavor_text: "" };
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "{}";
    const clean = text.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(clean);
    const nameLC = (parsed.name || "").toLowerCase();
    const flavorLC = (parsed.flavor_text || "").toLowerCase();
    for (const word of SAFETY_WORDS) {
      if (nameLC.includes(word) || flavorLC.includes(word)) {
        return { name: "", flavor_text: "" };
      }
    }
    return {
      name: parsed.name || "",
      flavor_text: parsed.flavor_text || ""
    };
  } catch {
    return { name: "", flavor_text: "" };
  }
}
__name(suggestName, "suggestName");

// src/save-card.js
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
}
__name(json, "json");
async function handleSaveCard(request, env2) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Expected multipart/form-data" }, 400);
  }
  const cardFile = formData.get("card");
  const creatureId = formData.get("creature_id");
  const creatureName = formData.get("creature_name") || "";
  if (!cardFile || !creatureId) {
    return json({ error: "Missing card file or creature_id" }, 400);
  }
  let cardBytes;
  try {
    cardBytes = await cardFile.arrayBuffer();
  } catch {
    return json({ error: "Failed to read card file" }, 400);
  }
  if (cardBytes.byteLength < 1e3) {
    return json({ error: "Card file too small \u2014 likely empty" }, 400);
  }
  const cardFileName = `cards/${creatureId}-card.png`;
  let cardUrl;
  try {
    cardUrl = await uploadToB2(cardBytes, cardFileName, "image/png", env2);
  } catch (e) {
    console.error("B2 upload error:", e);
    return json({ error: `Storage upload failed: ${e.message}` }, 500);
  }
  try {
    const updates = { card_url: cardUrl };
    if (creatureName.trim()) {
      updates.creature_name = creatureName.trim();
    }
    await finalizeCreature(env2, creatureId, updates);
  } catch (e) {
    console.error("Supabase finalize error (non-fatal):", e);
  }
  return json({
    success: true,
    card_url: cardUrl,
    creature_id: creatureId
  });
}
__name(handleSaveCard, "handleSaveCard");

// src/validate.js
function validateGenerateRequest(body) {
  if (!body) return "Request body is required";
  if (!body.userId) return "userId is required";
  const hasAudioFeatures = body.audioFeatures && typeof body.audioFeatures === "object";
  const hasProcessedData = body.morphology || body.audiotropeType;
  const hasSignal = body.signal && typeof body.signal === "object";
  if (!hasAudioFeatures && !hasProcessedData && !hasSignal) {
    return "Either audioFeatures, a verified signal, or processed creature attributes (morphology, audiotropeType) are required";
  }
  return null;
}
__name(validateGenerateRequest, "validateGenerateRequest");
function validateComposeRequest(body) {
  if (!body) return "Request body is required";
  if (!body.userId) return "userId is required";
  if (!body.creature_id) return "creature_id is required";
  if (!body.creature_url) return "creature_url is required";
  const name = (body.creature_name || "").trim();
  if (!name) return "creature_name is required";
  if (name.length < 2) return "creature_name must be at least 2 characters";
  if (name.length > 40) return "creature_name must be 40 characters or less";
  const BLOCKED = ["kill", "murder", "sex", "nude", "naked", "porn", "hate"];
  const nameLower = name.toLowerCase();
  for (const word of BLOCKED) {
    if (nameLower.includes(word)) return "creature_name contains inappropriate content";
  }
  return null;
}
__name(validateComposeRequest, "validateComposeRequest");

// src/morphologies.js
var RARITY_TIERS = {
  Abundant: { min: 0, max: 70, tiers: [1, 2, 3, 4, 5], label: "Abundant", color: "#8b9ead", accent: "#a0b4c0" },
  Endemic: { min: 70, max: 94, tiers: [6, 7, 8], label: "Endemic", color: "#c8a870", accent: "#dbb97a" },
  Holotype: { min: 94, max: 101, tiers: [9, 10], label: "Holotype", color: "#d4a0e0", accent: "#e8b8f0" }
};
var MORPHOLOGIES = [
  // ── TIER 1 — Abundant (10) ──
  { id: "flatfish", name: "Flatfish", tier: 1, domain: "aquatic", labels: ["SURFACE", "HEAD", "FINS", "TAIL"] },
  { id: "moth", name: "Moth", tier: 1, domain: "aerial", labels: ["WINGS", "ANTENNAE", "BODY", "LEGS"] },
  { id: "beetle", name: "Beetle", tier: 1, domain: "terrestrial", labels: ["HEAD", "CARAPACE", "LIMBS", "WINGS"] },
  { id: "fern", name: "Fern", tier: 1, domain: "flora", labels: ["FRONDS", "STEM", "ROOTS", "SPORES"] },
  { id: "coral", name: "Coral", tier: 1, domain: "aquatic", labels: ["POLYPS", "BRANCHES", "BASE", "TENDRILS"] },
  { id: "slug", name: "Slug", tier: 1, domain: "terrestrial", labels: ["MANTLE", "HEAD", "FOOT", "TENTACLES"] },
  { id: "minnow", name: "Minnow", tier: 1, domain: "aquatic", labels: ["FINS", "SCALES", "TAIL", "GILLS"] },
  { id: "grub", name: "Grub", tier: 1, domain: "terrestrial", labels: ["SEGMENTS", "HEAD", "LIMBS", "TAIL"] },
  { id: "mushroom", name: "Mushroom", tier: 1, domain: "flora", labels: ["CAP", "GILLS", "STALK", "MYCELIUM"] },
  { id: "guppy", name: "Guppy", tier: 1, domain: "aquatic", labels: ["FINS", "TAIL", "SCALES", "EYES"] },
  // ── TIER 2 — Abundant (8) ──
  { id: "gecko", name: "Gecko", tier: 2, domain: "terrestrial", labels: ["HEAD", "LIMBS", "TAIL", "SCALES"] },
  { id: "dragonfly", name: "Dragonfly", tier: 2, domain: "aerial", labels: ["WINGS", "EYES", "ABDOMEN", "LEGS"] },
  { id: "crayfish", name: "Crayfish", tier: 2, domain: "aquatic", labels: ["CLAWS", "CARAPACE", "ANTENNAE", "TAIL"] },
  { id: "centipede", name: "Centipede", tier: 2, domain: "terrestrial", labels: ["HEAD", "SEGMENTS", "LEGS", "MANDIBLES"] },
  { id: "anemone", name: "Sea Anemone", tier: 2, domain: "aquatic", labels: ["TENTACLES", "COLUMN", "DISC", "BASE"] },
  { id: "mantis", name: "Mantis", tier: 2, domain: "terrestrial", labels: ["RAPTORIAL ARMS", "WINGS", "HEAD", "ABDOMEN"] },
  { id: "toad", name: "Toad", tier: 2, domain: "terrestrial", labels: ["SKIN", "LIMBS", "HEAD", "EYES"] },
  { id: "cactus", name: "Cactus", tier: 2, domain: "flora", labels: ["SPINES", "PADS", "AREOLES", "ROOTS"] },
  // ── TIER 3 — Abundant (9) ──
  { id: "bat", name: "Bat", tier: 3, domain: "aerial", labels: ["WINGS", "EARS", "CLAWS", "TAIL"] },
  { id: "eel", name: "Eel", tier: 3, domain: "aquatic", labels: ["HEAD", "BODY", "FINS", "TAIL"] },
  { id: "mantis_shrimp", name: "Mantis Shrimp", tier: 3, domain: "aquatic", labels: ["RAPTORIAL CLAWS", "CARAPACE", "EYES", "TAIL"] },
  { id: "axolotl", name: "Axolotl", tier: 3, domain: "aquatic", labels: ["GILLS", "LIMBS", "HEAD", "TAIL"] },
  { id: "pangolin", name: "Pangolin", tier: 3, domain: "terrestrial", labels: ["SCALES", "CLAWS", "SNOUT", "TAIL"] },
  { id: "owl", name: "Owl", tier: 3, domain: "aerial", labels: ["WINGS", "TALONS", "DISC", "BEAK"] },
  { id: "venus_trap", name: "Venus Flytrap", tier: 3, domain: "flora", labels: ["LOBES", "TRIGGER HAIRS", "PETIOLE", "ROOTS"] },
  { id: "cuttlefish", name: "Cuttlefish", tier: 3, domain: "aquatic", labels: ["MANTLE", "TENTACLES", "FINS", "EYES"] },
  { id: "scorpion", name: "Scorpion", tier: 3, domain: "terrestrial", labels: ["PINCERS", "STINGER", "CARAPACE", "LEGS"] },
  // ── TIER 4 — Abundant (8) ──
  { id: "manta_ray", name: "Manta Ray", tier: 4, domain: "aquatic", labels: ["WINGS", "CEPHALIC FINS", "TAIL", "GILLS"] },
  { id: "chameleon", name: "Chameleon", tier: 4, domain: "terrestrial", labels: ["CASQUE", "TONGUE", "FEET", "TAIL"] },
  { id: "harpy", name: "Harpy", tier: 4, domain: "aerial", labels: ["WINGS", "TALONS", "CREST", "BEAK"] },
  { id: "vampire_squid", name: "Vampire Squid", tier: 4, domain: "aquatic", labels: ["WEBBING", "FINS", "PHOTOPHORES", "ARMS"] },
  { id: "basilisk", name: "Basilisk", tier: 4, domain: "terrestrial", labels: ["CREST", "SCALES", "LIMBS", "TAIL"] },
  { id: "sundew", name: "Sundew", tier: 4, domain: "flora", labels: ["TENTACLES", "MUCILAGE", "LEAF", "ROOTS"] },
  { id: "mimic_octopus", name: "Mimic Octopus", tier: 4, domain: "aquatic", labels: ["ARMS", "MANTLE", "SUCKERS", "EYES"] },
  { id: "jumping_spider", name: "Jumping Spider", tier: 4, domain: "terrestrial", labels: ["EYES", "PEDIPALPS", "LEGS", "ABDOMEN"] },
  // ── TIER 5 — Abundant (8) ──
  { id: "narwhal", name: "Narwhal", tier: 5, domain: "aquatic", labels: ["TUSK", "MELON", "FLUKES", "BODY"] },
  { id: "glaucus", name: "Blue Dragon", tier: 5, domain: "aquatic", labels: ["CERATA", "FOOT", "HEAD", "RHINOPHORES"] },
  { id: "bio_jelly", name: "Bioluminescent Jelly", tier: 5, domain: "aquatic", labels: ["BELL", "TENTACLES", "ORAL ARMS", "PHOTOPHORES"] },
  { id: "thunderhawk", name: "Thunderhawk", tier: 5, domain: "aerial", labels: ["WINGS", "TALONS", "CREST", "TAIL"] },
  { id: "thornback", name: "Thornback", tier: 5, domain: "terrestrial", labels: ["SPINES", "CARAPACE", "LIMBS", "TAIL"] },
  { id: "crystalvine", name: "Crystal Vine", tier: 5, domain: "flora", labels: ["CRYSTALS", "TENDRILS", "NODE", "ROOTS"] },
  { id: "wraith_moth", name: "Wraith Moth", tier: 5, domain: "aerial", labels: ["WINGS", "ANTENNAE", "EYESPOTS", "BODY"] },
  { id: "archerfish", name: "Archerfish", tier: 5, domain: "aquatic", labels: ["SNOUT", "FINS", "SCALES", "TAIL"] },
  // ── TIER 6 — Endemic (7) ──
  { id: "leviathan_eel", name: "Leviathan Eel", tier: 6, domain: "aquatic", labels: ["MAW", "BODY", "FINS", "TAIL"] },
  { id: "ember_serpent", name: "Ember Serpent", tier: 6, domain: "terrestrial", labels: ["HEAD", "SCALES", "BODY", "TAIL"] },
  { id: "stormwing", name: "Stormwing", tier: 6, domain: "aerial", labels: ["WINGS", "WINGTIPS", "CREST", "TAIL"] },
  { id: "deepcrawler", name: "Deepcrawler", tier: 6, domain: "aquatic", labels: ["MANDIBLES", "CARAPACE", "LIMBS", "PHOTOPHORES"] },
  { id: "voidbloom", name: "Voidbloom", tier: 6, domain: "flora", labels: ["PETALS", "STAMEN", "TENDRILS", "ROOTS"] },
  { id: "ironshell", name: "Ironshell", tier: 6, domain: "terrestrial", labels: ["SHELL", "LIMBS", "HEAD", "TAIL"] },
  { id: "resonant_beetle", name: "Resonant Beetle", tier: 6, domain: "terrestrial", labels: ["CARAPACE", "RESONATORS", "LIMBS", "MANDIBLES"] },
  // ── TIER 7 — Endemic (7) ──
  { id: "kraken_spawn", name: "Kraken Spawn", tier: 7, domain: "aquatic", labels: ["TENTACLES", "MANTLE", "BEAK", "EYES"] },
  { id: "phoenix_chick", name: "Phoenix Chick", tier: 7, domain: "aerial", labels: ["WINGS", "CREST", "TAIL FEATHERS", "TALONS"] },
  { id: "shadow_stalker", name: "Shadow Stalker", tier: 7, domain: "terrestrial", labels: ["SHADE FORM", "CLAWS", "EYES", "TAIL"] },
  { id: "aurora_ray", name: "Aurora Ray", tier: 7, domain: "aquatic", labels: ["WINGS", "CHROMATOPHORES", "TAIL", "STINGER"] },
  { id: "stone_colossus", name: "Stone Colossus", tier: 7, domain: "terrestrial", labels: ["CARAPACE", "LIMBS", "CORE", "HEAD"] },
  { id: "tempest_wyrm", name: "Tempest Wyrm", tier: 7, domain: "aerial", labels: ["WINGS", "BODY", "TAIL", "HEAD"] },
  { id: "ancient_mycelium", name: "Ancient Mycelium", tier: 7, domain: "flora", labels: ["NETWORK", "FRUITING BODY", "HYPHAE", "SPORE SAC"] },
  // ── TIER 8 — Endemic (7) ──
  { id: "abyssal_leviathan", name: "Abyssal Leviathan", tier: 8, domain: "aquatic", labels: ["MAWS", "BODY", "FINS", "TAIL"] },
  { id: "celestial_hawk", name: "Celestial Hawk", tier: 8, domain: "aerial", labels: ["STAR WINGS", "CORONA", "TALONS", "TAIL"] },
  { id: "void_carapace", name: "Void Carapace", tier: 8, domain: "terrestrial", labels: ["NULL SHELL", "LIMBS", "VOID CORE", "HEAD"] },
  { id: "primordial_jelly", name: "Primordial Jelly", tier: 8, domain: "aquatic", labels: ["BELL", "TENDRILS", "NUCLEUS", "LIGHT ORGANS"] },
  { id: "world_tree", name: "World Tree", tier: 8, domain: "flora", labels: ["CROWN", "TRUNK", "ROOTS", "HEARTWOOD"] },
  { id: "thunder_titan", name: "Thunder Titan", tier: 8, domain: "terrestrial", labels: ["STORM MANE", "BODY", "CLAWS", "TAIL"] },
  { id: "dream_weaver", name: "Dream Weaver", tier: 8, domain: "aerial", labels: ["SILK WINGS", "SPINNERETS", "EYES", "BODY"] },
  // ── TIER 9 — Holotype (8) ──
  { id: "god_whale", name: "God Whale", tier: 9, domain: "aquatic", labels: ["FLUKES", "BARNACLE CROWN", "BALEEN", "BODY"] },
  { id: "star_serpent", name: "Star Serpent", tier: 9, domain: "aerial", labels: ["CONSTELLATION SCALES", "HEAD", "BODY", "TAIL"] },
  { id: "ancient_tortoise", name: "Ancient Tortoise", tier: 9, domain: "terrestrial", labels: ["WORLD SHELL", "LIMBS", "HEAD", "TAIL"] },
  { id: "void_blossom", name: "Void Blossom", tier: 9, domain: "flora", labels: ["NULL PETALS", "STAMEN", "ROOTS", "AURA"] },
  { id: "aurora_titan", name: "Aurora Titan", tier: 9, domain: "aerial", labels: ["LIGHT WINGS", "CORONA", "CLAWS", "TAIL"] },
  { id: "deep_elder", name: "Deep Elder", tier: 9, domain: "aquatic", labels: ["TENTACLE CROWN", "MANTLE", "VOID EYES", "BODY"] },
  { id: "epoch_beetle", name: "Epoch Beetle", tier: 9, domain: "terrestrial", labels: ["TIME CARAPACE", "LIMBS", "MANDIBLES", "AURA"] },
  { id: "storm_sovereign", name: "Storm Sovereign", tier: 9, domain: "aerial", labels: ["LIGHTNING WINGS", "CREST", "CLAWS", "STORM TAIL"] },
  // ── TIER 10 — Holotype (7) ──
  { id: "omega_leviathan", name: "Omega Leviathan", tier: 10, domain: "aquatic", labels: ["VOID MAWS", "COSMIC BODY", "REALITY FINS", "DIMENSIONAL TAIL"] },
  { id: "chronos_wyrm", name: "Chronos Wyrm", tier: 10, domain: "aerial", labels: ["TIME WINGS", "TEMPORAL BODY", "REALITY CLAWS", "AEON TAIL"] },
  { id: "primordial_god", name: "Primordial God", tier: 10, domain: "terrestrial", labels: ["DIVINE CARAPACE", "VOID LIMBS", "WORLD CORE", "ETERNAL HEAD"] },
  { id: "genesis_bloom", name: "Genesis Bloom", tier: 10, domain: "flora", labels: ["CREATION PETALS", "REALITY ROOTS", "COSMIC STAMEN", "VOID AURA"] },
  { id: "abyssal_sovereign", name: "Abyssal Sovereign", tier: 10, domain: "aquatic", labels: ["REALITY TENTACLES", "VOID MANTLE", "COSMIC EYES", "TEMPORAL BODY"] },
  { id: "eternal_phoenix", name: "Eternal Phoenix", tier: 10, domain: "aerial", labels: ["STAR WINGS", "COSMIC CREST", "VOID TALONS", "INFINITY TAIL"] },
  { id: "world_devourer", name: "World Devourer", tier: 10, domain: "terrestrial", labels: ["VOID MAWS", "REALITY BODY", "COSMIC CLAWS", "DIMENSIONAL TAIL"] }
];
function getMorphologiesByTier(tiers) {
  return MORPHOLOGIES.filter((m) => tiers.includes(m.tier));
}
__name(getMorphologiesByTier, "getMorphologiesByTier");
function getMorphologyByName(name) {
  return MORPHOLOGIES.find((m) => m.name.toLowerCase() === name.toLowerCase());
}
__name(getMorphologyByName, "getMorphologyByName");

// src/rarity.js
function calculateRarityScore(audioFeatures) {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    spectralCentroid = 2e3,
    zeroCrossingRate = 0.05,
    duration = 2,
    tempo = 100,
    rms = 0.3
  } = audioFeatures;
  const durationPillar = Math.min(duration / 30, 1);
  const complexityPillar = Math.min(zeroCrossingRate / 0.12, 1) * 0.5 + // ZCR component
  Math.min(spectralCentroid / 6e3, 1) * 0.5;
  const intensityPillar = energy * 0.5 + Math.min(rms / 0.6, 1) * 0.5;
  const bandDiversity = (bassEnergy + midEnergy + highEnergy) / 3;
  const tempoBonus = Math.min(tempo / 180, 1) * 0.3;
  const baseScore = durationPillar * 30 + complexityPillar * 30 + intensityPillar * 25 + bandDiversity * 10 + tempoBonus * 5;
  const trifectaMin = Math.min(durationPillar, complexityPillar, intensityPillar);
  const trifectaBonus = trifectaMin > 0.6 ? (trifectaMin - 0.6) * 25 : 0;
  const jitter = (energy * 997 + tempo * 31) % 4 - 2;
  return Math.max(0, Math.min(100, baseScore + trifectaBonus + jitter));
}
__name(calculateRarityScore, "calculateRarityScore");
function scoreToRarity(score) {
  for (const [rarity, config2] of Object.entries(RARITY_TIERS)) {
    if (score >= config2.min && score < config2.max) return rarity;
  }
  return "Abundant";
}
__name(scoreToRarity, "scoreToRarity");
function selectMorphology(audioFeatures, rarityLabel) {
  const config2 = RARITY_TIERS[rarityLabel];
  const candidates = getMorphologiesByTier(config2.tiers);
  const {
    energy = 0.5,
    spectralCentroid = 2e3,
    bassEnergy = 0.5,
    highEnergy = 0.5,
    zeroCrossingRate = 0.05,
    duration = 5,
    tempo = 100,
    rms = 0.3
  } = audioFeatures;
  const hash = Math.abs(
    Math.floor(energy * 997) + Math.floor(spectralCentroid * 0.37) + Math.floor(bassEnergy * 1013) + Math.floor(highEnergy * 769) + Math.floor(zeroCrossingRate * 4001) + Math.floor(duration * 311) + Math.floor(tempo * 127) + Math.floor(rms * 2003)
  );
  const idx = hash % candidates.length;
  return candidates[idx];
}
__name(selectMorphology, "selectMorphology");
function selectTrope(audioFeatures) {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    rms = 0.3,
    brightness = 0.5,
    warmth = 0.5,
    roughness = 0.5,
    harmonicRatio = 0.5,
    zeroCrossingRate = 0.05,
    onsetDensity = 0.5,
    dynamicRange = 0.3,
    spectralCentroid = 2e3,
    spectralSpread = 1e3,
    spectralRolloff = 2e3,
    spectralFlatness = 0.5,
    spectralKurtosis = 0,
    spectralCrest = 1,
    perceptualSharpness = 0.5,
    chromaStrength = 0.5,
    perceptualSpread = 0.5
  } = audioFeatures;
  const centroidNorm = Math.min(1, spectralCentroid / 8e3);
  const spreadNorm = Math.min(1, spectralSpread / 3e3);
  const rolloffNorm = Math.min(1, spectralRolloff / 8e3);
  const kurtosisNorm = Math.min(1, Math.max(0, spectralKurtosis / 10));
  const crestNorm = Math.min(1, spectralCrest / 20);
  const zcrNorm = Math.min(1, zeroCrossingRate / 0.15);
  const fluxProxy = Math.min(1, onsetDensity * 0.6 + dynamicRange * 0.4);
  const overrides = [];
  if (bassEnergy > 0.7 && centroidNorm < 0.2 && rms > 0.5 && dynamicRange < 0.2) {
    overrides.push({ trope: "Terratrope", confidence: 4, tag: "deep-rumble" });
  }
  if (rms > 0.4 && centroidNorm < 0.25 && roughness > 0.6 && harmonicRatio < 0.3 && onsetDensity < 0.3) {
    overrides.push({ trope: "Terratrope", confidence: 5, tag: "grinding-stone" });
  }
  if (spreadNorm > 0.5 && centroidNorm < 0.3 && rms > 0.4 && fluxProxy < 0.25) {
    overrides.push({ trope: "Terratrope", confidence: 4, tag: "muddy-earth" });
  }
  if (centroidNorm < 0.35 && onsetDensity < 0.15 && perceptualSpread > 0.6 && perceptualSharpness < 0.2) {
    overrides.push({ trope: "Aquatrope", confidence: 4, tag: "flowing-water" });
  }
  if (harmonicRatio > 0.7 && rms < 0.15 && roughness < 0.15 && perceptualSharpness < 0.15) {
    overrides.push({ trope: "Aquatrope", confidence: 4, tag: "underwater" });
  }
  if (perceptualSpread > 0.6 && fluxProxy > 0.4 && centroidNorm < 0.4 && rms > 0.2 && rms < 0.5) {
    overrides.push({ trope: "Aquatrope", confidence: 4, tag: "bubbling" });
  }
  if (spectralFlatness > 0.6 && centroidNorm > 0.5 && onsetDensity < 0.15 && rms < 0.2) {
    overrides.push({ trope: "Aerotrope", confidence: 4, tag: "wind-breath" });
  }
  if (centroidNorm > 0.6 && bassEnergy < 0.1 && rms < 0.25 && perceptualSpread > 0.5) {
    overrides.push({ trope: "Aerotrope", confidence: 4, tag: "whistle-flute" });
  }
  if (zcrNorm > 0.6 && centroidNorm > 0.5 && rms < 0.25 && dynamicRange > 0.4) {
    overrides.push({ trope: "Aerotrope", confidence: 4, tag: "insect-flutter" });
  }
  if (onsetDensity > 0.6 && perceptualSharpness > 0.6 && dynamicRange > 0.5 && spectralFlatness > 0.4) {
    overrides.push({ trope: "Pyrotrope", confidence: 4, tag: "crackling-fire" });
  }
  if (rms > 0.7 && roughness > 0.6 && centroidNorm > 0.4 && harmonicRatio < 0.3) {
    overrides.push({ trope: "Pyrotrope", confidence: 4, tag: "explosion-roar" });
  }
  if (perceptualSharpness > 0.7 && centroidNorm > 0.5 && fluxProxy > 0.3 && spectralFlatness < 0.4) {
    overrides.push({ trope: "Pyrotrope", confidence: 4, tag: "electrical-spark" });
  }
  if (harmonicRatio > 0.6 && perceptualSharpness < 0.2 && roughness < 0.2 && perceptualSpread > 0.4) {
    overrides.push({ trope: "Floratrope", confidence: 4, tag: "organic-tonal" });
  }
  if (harmonicRatio > 0.4 && roughness < 0.25 && perceptualSpread > 0.5 && perceptualSharpness < 0.2 && zcrNorm < 0.3) {
    overrides.push({ trope: "Floratrope", confidence: 4, tag: "rustling-organic" });
  }
  if (kurtosisNorm > 0.6 && chromaStrength > 0.6 && spectralFlatness < 0.2 && centroidNorm > 0.4) {
    overrides.push({ trope: "Prismatrope", confidence: 4, tag: "bell-chime" });
  }
  if (harmonicRatio > 0.7 && centroidNorm > 0.5 && roughness < 0.1 && onsetDensity < 0.1) {
    overrides.push({ trope: "Prismatrope", confidence: 4, tag: "resonance-sustain" });
  }
  if (rolloffNorm > 0.6 && kurtosisNorm > 0.4 && chromaStrength > 0.5 && fluxProxy < 0.2) {
    overrides.push({ trope: "Prismatrope", confidence: 4, tag: "shimmer-glass" });
  }
  if (overrides.length > 0) {
    overrides.sort((a, b) => b.confidence - a.confidence);
    console.log(`[Trope] Override: ${overrides[0].trope} (${overrides[0].tag}) | ${overrides.length} total matches`);
    return overrides[0].trope;
  }
  const scores = {
    Terratrope: (1 - centroidNorm) * rms * (1 - perceptualSharpness) * spectralFlatness,
    Aquatrope: (1 - perceptualSharpness) * perceptualSpread * fluxProxy * (1 - crestNorm),
    Aerotrope: centroidNorm * (1 - rms) * fluxProxy * perceptualSpread,
    Pyrotrope: perceptualSharpness * fluxProxy * centroidNorm * spectralFlatness,
    Floratrope: chromaStrength / (spectralFlatness + 0.01) / 10 * // organicProxy, scaled down
    perceptualSpread * (1 - roughness) * harmonicRatio * zcrNorm,
    Prismatrope: kurtosisNorm * (1 - spectralFlatness) * chromaStrength * centroidNorm
  };
  let bestTrope = "Terratrope";
  let bestScore = -1;
  for (const [trope, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestTrope = trope;
    }
  }
  console.log(
    `[Trope] Scoring wheel: ${bestTrope} (${bestScore.toFixed(4)}) |`,
    Object.entries(scores).map(([t, s]) => `${t.slice(0, 5)}=${s.toFixed(3)}`).join(" ")
  );
  return bestTrope;
}
__name(selectTrope, "selectTrope");
function selectOrigen(inputType = "audio") {
  const map = {
    audio: "Resogen",
    image: "Imagen",
    video: "Kinogen",
    multi: "Synthogen",
    none: "Primogen"
  };
  return map[inputType] || "Resogen";
}
__name(selectOrigen, "selectOrigen");
function generateStats(audioFeatures, rarityScore) {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    rms = 0.3,
    onsetDensity = 0.5,
    duration = 5,
    roughness = 0.5,
    harmonicRatio = 0.5,
    brightness = 0.5,
    dynamicRange = 0.3,
    chromaStrength = 0.5,
    tempo = 100
  } = audioFeatures;
  const rarityBonus = rarityScore * 0.15;
  const tempoNorm = Math.min(1, tempo / 200);
  const durationNorm = Math.min(1, duration / 30);
  return {
    power: Math.min(100, Math.round((rms * 0.4 + bassEnergy * 0.4 + energy * 0.2) * 80 + rarityBonus)),
    agility: Math.min(100, Math.round((tempoNorm * 0.4 + onsetDensity * 0.3 + (1 - bassEnergy) * 0.3) * 80 + rarityBonus)),
    defense: Math.min(100, Math.round((durationNorm * 0.4 + bassEnergy * 0.3 + roughness * 0.3) * 80 + rarityBonus)),
    arcana: Math.min(100, Math.round((harmonicRatio * 0.3 + brightness * 0.3 + dynamicRange * 0.2 + chromaStrength * 0.2) * 80 + rarityBonus))
  };
}
__name(generateStats, "generateStats");
function analyzeAudio(audioFeatures) {
  const score = calculateRarityScore(audioFeatures);
  const rarity = scoreToRarity(score);
  const morphology = selectMorphology(audioFeatures, rarity);
  const trope = selectTrope(audioFeatures);
  const origen = selectOrigen("audio");
  const stats = generateStats(audioFeatures, score);
  return { score, rarity, morphology, trope, origen, stats };
}
__name(analyzeAudio, "analyzeAudio");

// src/season.js
function getCurrentSeason() {
  const month = (/* @__PURE__ */ new Date()).getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}
__name(getCurrentSeason, "getCurrentSeason");
function getSeasonFromAudio(audioFeatures) {
  const { energy = 0.5, tempo = 100 } = audioFeatures || {};
  const base = getCurrentSeason();
  if (energy > 0.9 && base !== "summer") return "summer";
  if (energy < 0.1 && base !== "winter") return "winter";
  return base;
}
__name(getSeasonFromAudio, "getSeasonFromAudio");

// src/signal-extractor.js
function parseWav(buffer) {
  const view = new DataView(buffer);
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  if (riff !== "RIFF") throw new Error("Not a valid WAV file");
  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);
  let dataOffset = 36;
  while (dataOffset < buffer.byteLength - 4) {
    const chunkId = String.fromCharCode(
      view.getUint8(dataOffset),
      view.getUint8(dataOffset + 1),
      view.getUint8(dataOffset + 2),
      view.getUint8(dataOffset + 3)
    );
    const chunkSize = view.getUint32(dataOffset + 4, true);
    if (chunkId === "data") {
      dataOffset += 8;
      break;
    }
    dataOffset += 8 + chunkSize;
  }
  const bytesPerSample = bitsPerSample / 8;
  const totalSamples = Math.floor((buffer.byteLength - dataOffset) / bytesPerSample / numChannels);
  const samples = new Float32Array(totalSamples);
  const maxVal = Math.pow(2, bitsPerSample - 1);
  for (let i = 0; i < totalSamples; i++) {
    let sum = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      const bytePos = dataOffset + (i * numChannels + ch) * bytesPerSample;
      if (bitsPerSample === 16) {
        sum += view.getInt16(bytePos, true) / maxVal;
      } else if (bitsPerSample === 24) {
        const b0 = view.getUint8(bytePos);
        const b1 = view.getUint8(bytePos + 1);
        const b2 = view.getUint8(bytePos + 2);
        let val = b2 << 16 | b1 << 8 | b0;
        if (val >= 8388608) val -= 16777216;
        sum += val / 8388608;
      } else if (bitsPerSample === 8) {
        sum += (view.getUint8(bytePos) - 128) / 128;
      } else if (bitsPerSample === 32) {
        sum += view.getInt32(bytePos, true) / 2147483648;
      }
    }
    samples[i] = sum / numChannels;
  }
  return { samples, sampleRate, numChannels, duration: totalSamples / sampleRate };
}
__name(parseWav, "parseWav");
function fft(real, imag) {
  const n = real.length;
  if (n <= 1) return;
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = real[i + k];
        const uIm = imag[i + k];
        const vRe = real[i + k + len / 2] * curRe - imag[i + k + len / 2] * curIm;
        const vIm = real[i + k + len / 2] * curRe + imag[i + k + len / 2] * curIm;
        const tRe = real[i + k + len / 2] * curRe - imag[i + k + len / 2] * curIm;
        const tIm = real[i + k + len / 2] * curIm + imag[i + k + len / 2] * curRe;
        real[i + k] = uRe + tRe;
        imag[i + k] = uIm + tIm;
        real[i + k + len / 2] = uRe - tRe;
        imag[i + k + len / 2] = uIm - tIm;
        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }
}
__name(fft, "fft");
function applyHannWindow(samples) {
  const n = samples.length;
  const windowed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    windowed[i] = samples[i] * 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
  }
  return windowed;
}
__name(applyHannWindow, "applyHannWindow");
function analyzeSpectrum(samples, sampleRate) {
  const FFT_SIZE = 2048;
  const HOP_SIZE = 512;
  const numBins = FFT_SIZE / 2;
  const binWidth = sampleRate / FFT_SIZE;
  const magnitudeSum = new Float64Array(numBins);
  let frameCount = 0;
  for (let start = 0; start + FFT_SIZE <= samples.length; start += HOP_SIZE) {
    const frame = samples.slice(start, start + FFT_SIZE);
    const windowed = applyHannWindow(frame);
    const real = new Float64Array(FFT_SIZE);
    const imag = new Float64Array(FFT_SIZE);
    for (let i = 0; i < FFT_SIZE; i++) real[i] = windowed[i];
    fft(real, imag);
    for (let i = 0; i < numBins; i++) {
      magnitudeSum[i] += Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    frameCount++;
  }
  if (frameCount === 0) throw new Error("Audio too short for analysis");
  const magnitudes = new Float64Array(numBins);
  for (let i = 0; i < numBins; i++) {
    magnitudes[i] = magnitudeSum[i] / frameCount;
  }
  return { magnitudes, binWidth, numBins };
}
__name(analyzeSpectrum, "analyzeSpectrum");
function computeFrequencyMetrics(magnitudes, binWidth, sampleRate) {
  const numBins = magnitudes.length;
  const totalEnergy = magnitudes.reduce((s, m) => s + m * m, 0);
  let weightedSum = 0;
  let magSum = 0;
  for (let i = 0; i < numBins; i++) {
    const freq = i * binWidth;
    weightedSum += freq * magnitudes[i];
    magSum += magnitudes[i];
  }
  const spectralCentroid = magSum > 0 ? weightedSum / magSum : 0;
  let spreadSum = 0;
  for (let i = 0; i < numBins; i++) {
    const freq = i * binWidth;
    const diff = freq - spectralCentroid;
    spreadSum += diff * diff * magnitudes[i];
  }
  const spectralSpread = magSum > 0 ? Math.sqrt(spreadSum / magSum) : 0;
  const rolloffThreshold = 0.85 * magSum;
  let cumMag = 0;
  let spectralRolloff = 0;
  for (let i = 0; i < numBins; i++) {
    cumMag += magnitudes[i];
    if (cumMag >= rolloffThreshold) {
      spectralRolloff = i * binWidth;
      break;
    }
  }
  const bands = {
    subBass: [20, 80],
    bass: [80, 250],
    lowMid: [250, 500],
    mid: [500, 2e3],
    highMid: [2e3, 4e3],
    highs: [4e3, 2e4]
  };
  const bandEnergy = {};
  let totalBandEnergy = 0;
  for (const [name, [lo, hi]] of Object.entries(bands)) {
    let energy = 0;
    const loIdx = Math.floor(lo / binWidth);
    const hiIdx = Math.min(Math.ceil(hi / binWidth), numBins - 1);
    for (let i = loIdx; i <= hiIdx; i++) {
      energy += magnitudes[i] * magnitudes[i];
    }
    bandEnergy[name] = energy;
    totalBandEnergy += energy;
  }
  const normalizedBands = {};
  for (const [name, energy] of Object.entries(bandEnergy)) {
    normalizedBands[name] = totalBandEnergy > 0 ? energy / totalBandEnergy : 0;
  }
  const brightness = normalizedBands.highs + normalizedBands.highMid * 0.5;
  const warmth = normalizedBands.subBass + normalizedBands.bass + normalizedBands.lowMid * 0.5;
  let irregularity = 0;
  for (let i = 1; i < numBins - 1; i++) {
    const diff = magnitudes[i] - (magnitudes[i - 1] + magnitudes[i] + magnitudes[i + 1]) / 3;
    irregularity += diff * diff;
  }
  const roughness = magSum > 0 ? Math.min(1, Math.sqrt(irregularity) / magSum) : 0;
  let peakBin = 0;
  let peakMag = 0;
  for (let i = 1; i < numBins; i++) {
    if (magnitudes[i] > peakMag) {
      peakMag = magnitudes[i];
      peakBin = i;
    }
  }
  let harmonicEnergy = 0;
  for (let h = 1; h <= 8; h++) {
    const hBin = peakBin * h;
    if (hBin >= numBins) break;
    for (let d = -2; d <= 2; d++) {
      const b = hBin + d;
      if (b >= 0 && b < numBins) harmonicEnergy += magnitudes[b] * magnitudes[b];
    }
  }
  const harmonicRatio = totalEnergy > 0 ? Math.min(1, harmonicEnergy / totalEnergy) : 0;
  const A4 = 440;
  const chromaEnergy = new Float64Array(12);
  for (let i = 1; i < numBins; i++) {
    const freq = i * binWidth;
    if (freq < 60 || freq > 4e3) continue;
    const midi = 69 + 12 * Math.log2(freq / A4);
    const pitchClass = Math.round(midi) % 12;
    if (pitchClass >= 0 && pitchClass < 12) {
      chromaEnergy[pitchClass] += magnitudes[i] * magnitudes[i];
    }
  }
  let dominantPitchClass = 0;
  let maxChroma = 0;
  for (let i = 0; i < 12; i++) {
    if (chromaEnergy[i] > maxChroma) {
      maxChroma = chromaEnergy[i];
      dominantPitchClass = i;
    }
  }
  const totalChroma = chromaEnergy.reduce((s, v) => s + v, 0);
  const chromaStrength = totalChroma > 0 ? maxChroma / totalChroma : 0;
  let logSum = 0;
  let linSum = 0;
  let validBins = 0;
  for (let i = 1; i < numBins; i++) {
    const m = magnitudes[i];
    if (m > 1e-10) {
      logSum += Math.log(m);
      linSum += m;
      validBins++;
    }
  }
  const spectralFlatness = validBins > 0 && linSum > 0 ? Math.exp(logSum / validBins) / (linSum / validBins) : 0;
  let mu4 = 0;
  let mu2 = 0;
  for (let i = 0; i < numBins; i++) {
    const freq = i * binWidth;
    const diff = freq - spectralCentroid;
    const w = magnitudes[i] / (magSum || 1);
    mu2 += diff * diff * w;
    mu4 += diff * diff * diff * diff * w;
  }
  const spectralKurtosis = mu2 > 0 ? mu4 / (mu2 * mu2) - 3 : 0;
  const meanMag = numBins > 0 ? magSum / numBins : 1;
  const spectralCrest = meanMag > 0 ? peakMag / meanMag : 0;
  let sharpNum = 0;
  let sharpDen = 0;
  for (let i = 0; i < numBins; i++) {
    const freq = i * binWidth;
    const bark = 13 * Math.atan(76e-5 * freq) + 3.5 * Math.atan(freq / 7500 * (freq / 7500));
    const weight = bark > 15 ? 0.066 * Math.exp(0.171 * bark) : 1;
    const energy = magnitudes[i] * magnitudes[i];
    sharpNum += energy * weight * bark;
    sharpDen += energy * bark;
  }
  const perceptualSharpness = sharpDen > 0 ? Math.min(1, (sharpNum / sharpDen - 1) / 3) : 0;
  const bandValues = Object.values(normalizedBands);
  const bandMean = bandValues.reduce((s, v) => s + v, 0) / bandValues.length;
  const bandVariance = bandValues.reduce((s, v) => s + (v - bandMean) * (v - bandMean), 0) / bandValues.length;
  const bandEvenness = 1 - Math.min(1, Math.sqrt(bandVariance) * 4);
  const spreadNorm = Math.min(1, spectralSpread / 3e3);
  const perceptualSpread = spreadNorm * 0.5 + bandEvenness * 0.5;
  return {
    spectralCentroid: Math.round(spectralCentroid),
    spectralSpread: Math.round(spectralSpread),
    spectralRolloff: Math.round(spectralRolloff),
    brightness: parseFloat(brightness.toFixed(4)),
    warmth: parseFloat(warmth.toFixed(4)),
    roughness: parseFloat(roughness.toFixed(4)),
    harmonicRatio: parseFloat(harmonicRatio.toFixed(4)),
    dominantPitchClass,
    bandEnergy: Object.fromEntries(
      Object.entries(normalizedBands).map(([k, v]) => [k, parseFloat(v.toFixed(4))])
    ),
    spectralFlatness: parseFloat(Math.min(1, spectralFlatness).toFixed(4)),
    spectralKurtosis: parseFloat(Math.max(0, Math.min(20, spectralKurtosis)).toFixed(4)),
    spectralCrest: parseFloat(Math.min(50, spectralCrest).toFixed(4)),
    perceptualSharpness: parseFloat(Math.max(0, Math.min(1, perceptualSharpness)).toFixed(4)),
    chromaStrength: parseFloat(chromaStrength.toFixed(4)),
    perceptualSpread: parseFloat(perceptualSpread.toFixed(4))
  };
}
__name(computeFrequencyMetrics, "computeFrequencyMetrics");
function computeTimeDomainMetrics(samples, sampleRate) {
  const n = samples.length;
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += samples[i] * samples[i];
  const rms = Math.sqrt(sumSq / n);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peak) peak = abs;
  }
  let crossings = 0;
  for (let i = 1; i < n; i++) {
    if (samples[i] >= 0 !== samples[i - 1] >= 0) crossings++;
  }
  const zeroCrossingRate = crossings / n;
  const FRAME = 128;
  const framePowers = [];
  for (let i = 0; i + FRAME <= n; i += FRAME) {
    let sq = 0;
    for (let j = i; j < i + FRAME; j++) sq += samples[j] * samples[j];
    framePowers.push(sq / FRAME);
  }
  framePowers.sort((a, b) => a - b);
  const p10 = framePowers[Math.floor(framePowers.length * 0.1)] || 1e-4;
  const p90 = framePowers[Math.floor(framePowers.length * 0.9)] || 1e-4;
  const dynamicRange = parseFloat(Math.min(1, p90 / (p10 + 1e-4) / 100).toFixed(4));
  const HOP = 256;
  let prevEnergy = 0;
  let onsets = 0;
  const onsetThreshold = rms * 1.5;
  for (let i = 0; i + HOP <= n; i += HOP) {
    let energy = 0;
    for (let j = i; j < i + HOP; j++) energy += samples[j] * samples[j];
    energy /= HOP;
    if (energy - prevEnergy > onsetThreshold) onsets++;
    prevEnergy = energy;
  }
  const duration = n / sampleRate;
  const onsetDensity = duration > 0 ? parseFloat((onsets / duration).toFixed(4)) : 0;
  const CORR_FRAME = Math.min(n, sampleRate * 3);
  const energyFrames = [];
  const ENV_HOP = 64;
  for (let i = 0; i + ENV_HOP <= CORR_FRAME; i += ENV_HOP) {
    let e = 0;
    for (let j = i; j < i + ENV_HOP; j++) e += samples[j] * samples[j];
    energyFrames.push(e / ENV_HOP);
  }
  const minLag = Math.floor(60 / 200 * sampleRate / ENV_HOP);
  const maxLag = Math.floor(60 / 60 * sampleRate / ENV_HOP);
  let bestLag = minLag;
  let bestCorr = -Infinity;
  for (let lag = minLag; lag <= Math.min(maxLag, energyFrames.length / 2); lag++) {
    let corr = 0;
    for (let i = 0; i + lag < energyFrames.length; i++) {
      corr += energyFrames[i] * energyFrames[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }
  const bpm = parseFloat((60 / (bestLag * ENV_HOP / sampleRate)).toFixed(1));
  return {
    rms: parseFloat(rms.toFixed(4)),
    peak: parseFloat(peak.toFixed(4)),
    zeroCrossingRate: parseFloat(zeroCrossingRate.toFixed(4)),
    dynamicRange,
    onsetDensity,
    bpm: Math.max(40, Math.min(220, bpm)),
    // clamp to sane range
    duration: parseFloat(duration.toFixed(3))
  };
}
__name(computeTimeDomainMetrics, "computeTimeDomainMetrics");
async function getContextEntropy(request) {
  const now = /* @__PURE__ */ new Date();
  const timestamp = now.getTime();
  const hour = now.getUTCHours();
  const timeOfDay = hour >= 5 && hour < 8 ? "dawn" : hour >= 8 && hour < 17 ? "day" : hour >= 17 && hour < 20 ? "dusk" : "night";
  const month = now.getUTCMonth();
  const season = month >= 2 && month <= 4 ? "spring" : month >= 5 && month <= 7 ? "summer" : month >= 8 && month <= 10 ? "autumn" : "winter";
  const rawLat = parseFloat(request.headers.get("CF-IPCountry") ? "0" : "0");
  const cfLat = parseFloat(request.headers.get("CF-Latitude") || "0");
  const cfLon = parseFloat(request.headers.get("CF-Longitude") || "0");
  const lat = Math.round(cfLat * 10) / 10;
  const lon = Math.round(cfLon * 10) / 10;
  const region = request.headers.get("CF-IPCountry") || "XX";
  let weather = { condition: "unknown", temperature: 15, windspeed: 0 };
  if (lat !== 0 || lon !== 0) {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&forecast_days=1`;
      const resp = await fetch(weatherUrl, { signal: AbortSignal.timeout(3e3) });
      if (resp.ok) {
        const data = await resp.json();
        const cw = data.current_weather || {};
        const code = cw.weathercode || 0;
        const condition = code === 0 ? "clear" : code <= 3 ? "cloudy" : code <= 49 ? "foggy" : code <= 69 ? "rainy" : code <= 79 ? "snowy" : code <= 99 ? "stormy" : "unknown";
        weather = {
          condition,
          temperature: Math.round(cw.temperature ?? 15),
          windspeed: Math.round(cw.windspeed ?? 0)
        };
      }
    } catch (_) {
    }
  }
  return {
    timestamp,
    timeOfDay,
    season,
    lat,
    lon,
    region,
    weather
  };
}
__name(getContextEntropy, "getContextEntropy");
function buildSignalIntelligence(freqMetrics, timeMetrics, context2) {
  const {
    spectralCentroid,
    brightness,
    warmth,
    roughness,
    harmonicRatio,
    spectralSpread,
    bandEnergy,
    dominantPitchClass
  } = freqMetrics;
  const { rms, zeroCrossingRate, dynamicRange, onsetDensity, bpm, duration } = timeMetrics;
  let tropeSignal = null;
  let tropeStrength = "none";
  if (bandEnergy.bass > 0.35 && warmth > 0.45) {
    tropeSignal = "Terratrope";
    tropeStrength = bandEnergy.bass > 0.5 ? "strong" : "weak";
  } else if (bandEnergy.highs > 0.3 || brightness > 0.35) {
    tropeSignal = "Aerotrope";
    tropeStrength = brightness > 0.5 ? "strong" : "weak";
  } else if (rms < 0.08 && zeroCrossingRate < 0.03) {
    tropeSignal = "Aquatrope";
    tropeStrength = "strong";
  } else if (rms > 0.75 && dynamicRange < 0.15) {
    tropeSignal = "Pyrotrope";
    tropeStrength = "strong";
  } else if (harmonicRatio > 0.65 && spectralCentroid < 1500) {
    tropeSignal = "Floratrope";
    tropeStrength = "weak";
  } else if (brightness > 0.25 && roughness < 0.15) {
    tropeSignal = "Prismatrope";
    tropeStrength = "weak";
  }
  const complexity = Math.min(1, zeroCrossingRate * 15);
  const intensity = Math.min(1, rms * 2.5);
  const ars = parseFloat((complexity * 0.25 + intensity * 0.2 + harmonicRatio * 0.2 + brightness * 0.15 + Math.min(duration, 10) / 10 * 0.1 + roughness * 0.1).toFixed(4));
  const evolutionProxy = parseFloat(Math.min(
    1,
    Math.min(duration, 8) / 8 * 0.5 + spectralSpread / 5e3 * 0.3 + ars * 0.2
  ).toFixed(4));
  const intelligence = parseFloat(Math.min(
    1,
    harmonicRatio * 0.5 + (1 - roughness) * 0.3 + spectralCentroid / 8e3 * 0.2
  ).toFixed(4));
  const bodySize = parseFloat(Math.min(
    1,
    warmth * 0.6 + Math.min(rms, 0.8) / 0.8 * 0.4
  ).toFixed(4));
  const surfaceTexture = parseFloat(Math.min(
    1,
    roughness * 0.6 + complexity * 0.4
  ).toFixed(4));
  const patternDetail = parseFloat(Math.min(
    1,
    Math.min(onsetDensity / 10, 1) * 0.5 + spectralSpread / 5e3 * 0.5
  ).toFixed(4));
  const colorPalette = dominantPitchClass;
  const weatherBonus = context2.weather.condition === "stormy" ? 0.08 : context2.weather.condition === "clear" ? 0.03 : context2.weather.condition === "snowy" ? 0.05 : 0;
  const timeBonus = context2.timeOfDay === "dawn" ? 0.04 : context2.timeOfDay === "night" ? 0.06 : 0;
  const contextModifier = parseFloat(Math.min(0.15, weatherBonus + timeBonus).toFixed(4));
  return {
    tropeSignal,
    tropeStrength,
    ars,
    contextModifier,
    arsAdjusted: parseFloat(Math.min(1, ars + contextModifier).toFixed(4)),
    evolutionProxy,
    intelligence,
    bodySize,
    surfaceTexture,
    patternDetail,
    colorPalette,
    bpm
  };
}
__name(buildSignalIntelligence, "buildSignalIntelligence");
async function extractSignal(audioBuffer, request) {
  let parsed;
  try {
    parsed = parseWav(audioBuffer);
  } catch (e) {
    throw new Error(`Audio parsing failed: ${e.message}`);
  }
  const { samples, sampleRate, duration } = parsed;
  if (duration < 0.5) throw new Error("Audio too short (minimum 0.5 seconds)");
  if (duration > 300) throw new Error("Audio too long (maximum 5 minutes)");
  let workSamples = samples;
  let workRate = sampleRate;
  if (sampleRate > 22050) {
    const ratio = Math.floor(sampleRate / 22050);
    workSamples = new Float32Array(Math.floor(samples.length / ratio));
    for (let i = 0; i < workSamples.length; i++) workSamples[i] = samples[i * ratio];
    workRate = Math.floor(sampleRate / ratio);
  }
  const { magnitudes, binWidth, numBins } = analyzeSpectrum(workSamples, workRate);
  const freqMetrics = computeFrequencyMetrics(magnitudes, binWidth, workRate);
  const timeMetrics = computeTimeDomainMetrics(workSamples, workRate);
  const context2 = await getContextEntropy(request);
  const intelligence = buildSignalIntelligence(freqMetrics, timeMetrics, context2);
  return {
    version: "1.0",
    origen: "Resogen",
    extractedAt: context2.timestamp,
    frequency: freqMetrics,
    time: timeMetrics,
    context: context2,
    intelligence
  };
}
__name(extractSignal, "extractSignal");

// src/image-extractor.js
async function decodePNG(buffer) {
  const view = new DataView(buffer);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(i) !== sig[i]) throw new Error("Not a valid PNG file");
  }
  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];
  while (offset < buffer.byteLength) {
    const chunkLength = view.getUint32(offset);
    const chunkType = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );
    if (chunkType === "IHDR") {
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
      bitDepth = view.getUint8(offset + 16);
      colorType = view.getUint8(offset + 17);
    } else if (chunkType === "IDAT") {
      idatChunks.push(new Uint8Array(buffer, offset + 8, chunkLength));
    } else if (chunkType === "IEND") {
      break;
    }
    offset += 12 + chunkLength;
  }
  if (width === 0 || height === 0) throw new Error("Invalid PNG: no IHDR");
  if (bitDepth !== 8) throw new Error(`Unsupported PNG bit depth: ${bitDepth} (only 8-bit supported)`);
  const totalSize = idatChunks.reduce((s, c) => s + c.length, 0);
  const compressed = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of idatChunks) {
    compressed.set(chunk, pos);
    pos += chunk.length;
  }
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();
  writer.write(compressed);
  writer.close();
  const decompressedChunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    decompressedChunks.push(value);
  }
  const decompressedSize = decompressedChunks.reduce((s, c) => s + c.length, 0);
  const decompressed = new Uint8Array(decompressedSize);
  pos = 0;
  for (const chunk of decompressedChunks) {
    decompressed.set(chunk, pos);
    pos += chunk.length;
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const bpp = channels;
  const stride = width * bpp + 1;
  const pixels = new Uint8Array(width * height * 4);
  const raw = decompressed;
  for (let y = 0; y < height; y++) {
    const filterType = raw[y * stride];
    const scanStart = y * stride + 1;
    const prevStart = (y - 1) * stride + 1;
    for (let x = 0; x < width * bpp; x++) {
      const i = scanStart + x;
      let val = raw[i];
      const a = x >= bpp ? raw[i - bpp] : 0;
      const b = y > 0 ? raw[prevStart + x] : 0;
      const c = x >= bpp && y > 0 ? raw[prevStart + x - bpp] : 0;
      switch (filterType) {
        case 0:
          break;
        // None
        case 1:
          val = val + a & 255;
          break;
        // Sub
        case 2:
          val = val + b & 255;
          break;
        // Up
        case 3:
          val = val + Math.floor((a + b) / 2) & 255;
          break;
        // Average
        case 4:
          val = val + paethPredictor(a, b, c) & 255;
          break;
      }
      raw[i] = val;
      const px = Math.floor(x / bpp);
      const ch = x % bpp;
      const outIdx = (y * width + px) * 4;
      if (channels === 4) {
        pixels[outIdx + ch] = val;
      } else if (channels === 3) {
        pixels[outIdx + ch] = val;
        if (ch === 2) pixels[outIdx + 3] = 255;
      } else if (channels === 2) {
        if (ch === 0) {
          pixels[outIdx] = pixels[outIdx + 1] = pixels[outIdx + 2] = val;
        }
        if (ch === 1) {
          pixels[outIdx + 3] = val;
        }
      } else {
        pixels[outIdx] = pixels[outIdx + 1] = pixels[outIdx + 2] = val;
        pixels[outIdx + 3] = 255;
      }
    }
  }
  return { pixels, width, height, channels };
}
__name(decodePNG, "decodePNG");
function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}
__name(paethPredictor, "paethPredictor");
function extractVisualFeatures(pixels, width, height) {
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / 5e4));
  const hueHist = new Float64Array(360);
  const satHist = new Float64Array(100);
  const lumHist = new Float64Array(100);
  let totalR = 0, totalG = 0, totalB = 0;
  let maxLum = 0, minLum = 1;
  let samples = 0;
  let edgeSum = 0;
  let edgeCount = 0;
  let symDiff = 0;
  let symCount = 0;
  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    const r = pixels[idx] / 255;
    const g = pixels[idx + 1] / 255;
    const b = pixels[idx + 2] / 255;
    totalR += r;
    totalG += g;
    totalB += b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (max + min) / 2;
    lumHist[Math.min(99, Math.floor(lum * 100))]++;
    if (lum > maxLum) maxLum = lum;
    if (lum < minLum) minLum = lum;
    let hue = 0, sat = 0;
    if (max !== min) {
      const d = max - min;
      sat = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) hue = ((b - r) / d + 2) * 60;
      else hue = ((r - g) / d + 4) * 60;
    }
    hueHist[Math.floor(hue) % 360]++;
    satHist[Math.min(99, Math.floor(sat * 100))]++;
    samples++;
    const x = i % width;
    const y = Math.floor(i / width);
    if (x < width - 1 && y < height - 1) {
      const rIdx = (i + 1) * 4;
      const bIdx = (i + width) * 4;
      if (rIdx + 2 < pixels.length && bIdx + 2 < pixels.length) {
        const gx = Math.abs(pixels[idx] - pixels[rIdx]) + Math.abs(pixels[idx + 1] - pixels[rIdx + 1]) + Math.abs(pixels[idx + 2] - pixels[rIdx + 2]);
        const gy = Math.abs(pixels[idx] - pixels[bIdx]) + Math.abs(pixels[idx + 1] - pixels[bIdx + 1]) + Math.abs(pixels[idx + 2] - pixels[bIdx + 2]);
        edgeSum += Math.sqrt(gx * gx + gy * gy) / (255 * 3);
        edgeCount++;
      }
    }
    const mirrorX = width - 1 - x;
    if (x < width / 2) {
      const mirrorIdx = (y * width + mirrorX) * 4;
      if (mirrorIdx + 2 < pixels.length) {
        symDiff += (Math.abs(pixels[idx] - pixels[mirrorIdx]) + Math.abs(pixels[idx + 1] - pixels[mirrorIdx + 1]) + Math.abs(pixels[idx + 2] - pixels[mirrorIdx + 2])) / (255 * 3);
        symCount++;
      }
    }
  }
  const avgR = totalR / samples;
  const avgG = totalG / samples;
  const avgB = totalB / samples;
  const warmth = Math.min(1, Math.max(0, avgR - avgB + 0.5));
  const coolness = 1 - warmth;
  let satSum = 0, satTotal = 0;
  for (let i = 0; i < 100; i++) {
    satSum += i * satHist[i];
    satTotal += satHist[i];
  }
  const meanSaturation = satTotal > 0 ? satSum / satTotal / 100 : 0;
  let lumSum = 0, lumTotal = 0;
  for (let i = 0; i < 100; i++) {
    lumSum += i * lumHist[i];
    lumTotal += lumHist[i];
  }
  const meanLuminance = lumTotal > 0 ? lumSum / lumTotal / 100 : 0.5;
  const luminanceContrast = maxLum - minLum;
  const lumMean = meanLuminance * 100;
  let lumVar = 0;
  for (let i = 0; i < 100; i++) {
    lumVar += (i - lumMean) * (i - lumMean) * lumHist[i];
  }
  const luminanceVariance = lumTotal > 0 ? Math.sqrt(lumVar / lumTotal) / 50 : 0;
  const edgeDensity = edgeCount > 0 ? Math.min(1, edgeSum / edgeCount * 3) : 0;
  const symmetryScore = symCount > 0 ? Math.max(0, 1 - symDiff / symCount * 2) : 0.5;
  let dominantHue = 0;
  let maxHueCount = 0;
  for (let i = 0; i < 360; i++) {
    if (hueHist[i] > maxHueCount) {
      maxHueCount = hueHist[i];
      dominantHue = i;
    }
  }
  const hueThreshold = maxHueCount * 0.1;
  let activeHues = 0;
  for (let i = 0; i < 360; i++) {
    if (hueHist[i] > hueThreshold) activeHues++;
  }
  const hueSpread = Math.min(1, activeHues / 180);
  const colorComplexity = Math.min(1, hueSpread * 0.5 + meanSaturation * 0.3 + luminanceVariance * 0.2);
  const resolutionProxy = Math.min(1, Math.sqrt(width * height) / 4e3);
  const textureComplexity = edgeDensity;
  const objectDensity = Math.min(1, edgeDensity * 0.6 + colorComplexity * 0.4);
  const brightness = meanLuminance;
  return {
    // Core color features
    dominantHue,
    // 0-360 degrees
    warmth,
    // 0-1 (warm=red-heavy, cool=blue-heavy)
    meanSaturation,
    // 0-1
    meanLuminance,
    // 0-1
    luminanceContrast,
    // 0-1 (dynamic range)
    luminanceVariance,
    // 0-1
    hueSpread,
    // 0-1 (monochrome to rainbow)
    colorComplexity,
    // 0-1
    // Spatial features
    edgeDensity,
    // 0-1 (smooth to busy)
    symmetryScore,
    // 0-1 (asymmetric to symmetric)
    textureComplexity,
    // 0-1 (smooth to detailed)
    objectDensity,
    // 0-1 (sparse to dense)
    // Meta
    brightness,
    // 0-1
    resolutionProxy,
    // 0-1 (tiny to large image)
    width,
    height
  };
}
__name(extractVisualFeatures, "extractVisualFeatures");
function mapVisualToCreatureFeatures(visual) {
  const {
    warmth,
    meanSaturation,
    meanLuminance,
    luminanceContrast,
    luminanceVariance,
    hueSpread,
    colorComplexity,
    edgeDensity,
    symmetryScore,
    textureComplexity,
    objectDensity,
    brightness,
    resolutionProxy,
    dominantHue
  } = visual;
  return {
    energy: Math.min(1, meanSaturation * 0.5 + luminanceContrast * 0.5),
    bassEnergy: Math.min(1, (1 - brightness) * 0.5 + warmth * 0.3 + (1 - edgeDensity) * 0.2),
    midEnergy: Math.min(1, colorComplexity * 0.5 + hueSpread * 0.5),
    highEnergy: Math.min(1, brightness * 0.5 + edgeDensity * 0.3 + meanSaturation * 0.2),
    spectralCentroid: Math.round(brightness * 6e3 + 500),
    zeroCrossingRate: textureComplexity * 0.12,
    duration: resolutionProxy * 25 + 3,
    // bigger image = more "developed"
    tempo: Math.round(60 + edgeDensity * 120),
    // busy = fast
    rms: Math.min(1, luminanceContrast * 0.5 + meanSaturation * 0.5),
    brightness,
    warmth,
    roughness: textureComplexity,
    harmonicRatio: symmetryScore * 0.6 + (1 - textureComplexity) * 0.4,
    dynamicRange: luminanceVariance,
    onsetDensity: objectDensity * 8,
    // New features for trope scoring wheel
    spectralFlatness: hueSpread * 0.6 + (1 - symmetryScore) * 0.4,
    spectralKurtosis: Math.max(0, (1 - hueSpread) * 10),
    // narrow hue = peaky
    spectralCrest: Math.max(1, (1 - hueSpread) * 15),
    perceptualSharpness: edgeDensity * 0.6 + luminanceContrast * 0.4,
    chromaStrength: meanSaturation * 0.5 + (1 - hueSpread) * 0.5,
    perceptualSpread: hueSpread * 0.4 + colorComplexity * 0.3 + luminanceVariance * 0.3,
    spectralSpread: Math.round(colorComplexity * 3e3),
    spectralRolloff: Math.round(brightness * 6e3 + 1e3)
  };
}
__name(mapVisualToCreatureFeatures, "mapVisualToCreatureFeatures");
function getVisualTropeHint(visual) {
  const {
    warmth,
    brightness,
    edgeDensity,
    meanSaturation,
    textureComplexity,
    symmetryScore,
    luminanceContrast
  } = visual;
  if (warmth > 0.7 && luminanceContrast > 0.5) return "Pyrotrope";
  if (brightness > 0.65 && edgeDensity < 0.3) return "Aerotrope";
  if (warmth < 0.4 && brightness > 0.5 && symmetryScore > 0.6) return "Prismatrope";
  if (warmth > 0.5 && meanSaturation > 0.4 && textureComplexity > 0.4) return "Floratrope";
  if (brightness < 0.4 && edgeDensity < 0.4) return "Aquatrope";
  return "Terratrope";
}
__name(getVisualTropeHint, "getVisualTropeHint");
function extractColorPalette(pixels, width, height) {
  const buckets = new Array(27).fill(null).map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
  const step = Math.max(1, Math.floor(width * height / 2e4));
  for (let i = 0; i < width * height; i += step) {
    const idx = i * 4;
    const rBin = Math.min(2, Math.floor(pixels[idx] / 86));
    const gBin = Math.min(2, Math.floor(pixels[idx + 1] / 86));
    const bBin = Math.min(2, Math.floor(pixels[idx + 2] / 86));
    const bin = rBin * 9 + gBin * 3 + bBin;
    buckets[bin].r += pixels[idx];
    buckets[bin].g += pixels[idx + 1];
    buckets[bin].b += pixels[idx + 2];
    buckets[bin].count++;
  }
  const sorted = buckets.filter((b) => b.count > 0).sort((a, b) => b.count - a.count).slice(0, 3).map((b) => {
    const r = Math.round(b.r / b.count);
    const g = Math.round(b.g / b.count);
    const bl = Math.round(b.b / b.count);
    return rgbToColorName(r, g, bl);
  });
  return sorted.length >= 3 ? sorted : ["warm gray", "soft blue", "muted gold"];
}
__name(extractColorPalette, "extractColorPalette");
function rgbToColorName(r, g, b) {
  const lum = (r + g + b) / 3;
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
  if (sat < 0.15) {
    if (lum > 200) return "soft white";
    if (lum > 150) return "pale silver";
    if (lum > 100) return "warm gray";
    if (lum > 50) return "slate gray";
    return "deep charcoal";
  }
  const hue = rgbToHue(r, g, b);
  const prefix = lum > 180 ? "pale" : lum > 120 ? "soft" : lum > 70 ? "rich" : "deep";
  if (hue < 15 || hue >= 345) return `${prefix} red`;
  if (hue < 35) return `${prefix} orange`;
  if (hue < 65) return `${prefix} gold`;
  if (hue < 80) return `${prefix} yellow`;
  if (hue < 155) return `${prefix} green`;
  if (hue < 185) return `${prefix} teal`;
  if (hue < 250) return `${prefix} blue`;
  if (hue < 290) return `${prefix} purple`;
  if (hue < 345) return `${prefix} magenta`;
  return `${prefix} red`;
}
__name(rgbToColorName, "rgbToColorName");
function rgbToHue(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return h;
}
__name(rgbToHue, "rgbToHue");
async function getImageContextEntropy(request) {
  const now = /* @__PURE__ */ new Date();
  const timestamp = now.getTime();
  const hour = now.getUTCHours();
  const timeOfDay = hour >= 5 && hour < 8 ? "dawn" : hour >= 8 && hour < 17 ? "day" : hour >= 17 && hour < 20 ? "dusk" : "night";
  const month = now.getUTCMonth();
  const season = month >= 2 && month <= 4 ? "spring" : month >= 5 && month <= 7 ? "summer" : month >= 8 && month <= 10 ? "autumn" : "winter";
  const cfLat = parseFloat(request.headers.get("CF-Latitude") || "0");
  const cfLon = parseFloat(request.headers.get("CF-Longitude") || "0");
  const lat = Math.round(cfLat * 10) / 10;
  const lon = Math.round(cfLon * 10) / 10;
  const region = request.headers.get("CF-IPCountry") || "XX";
  let weather = { condition: "unknown", temperature: 15, windspeed: 0 };
  if (lat !== 0 || lon !== 0) {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&forecast_days=1`;
      const resp = await fetch(weatherUrl, { signal: AbortSignal.timeout(3e3) });
      if (resp.ok) {
        const data = await resp.json();
        const cw = data.current_weather || {};
        const code = cw.weathercode || 0;
        const condition = code === 0 ? "clear" : code <= 3 ? "cloudy" : code <= 49 ? "foggy" : code <= 69 ? "rainy" : code <= 79 ? "snowy" : code <= 99 ? "stormy" : "unknown";
        weather = {
          condition,
          temperature: Math.round(cw.temperature ?? 15),
          windspeed: Math.round(cw.windspeed ?? 0)
        };
      }
    } catch (_) {
    }
  }
  return { timestamp, timeOfDay, season, lat, lon, region, weather };
}
__name(getImageContextEntropy, "getImageContextEntropy");
function buildImageIntelligence(visual, creatureFeatures, context2) {
  const {
    warmth,
    brightness,
    edgeDensity,
    meanSaturation,
    textureComplexity,
    symmetryScore,
    luminanceContrast,
    hueSpread,
    colorComplexity,
    resolutionProxy,
    dominantHue
  } = visual;
  const tropeHint = getVisualTropeHint(visual);
  const ars = parseFloat(Math.min(
    1,
    colorComplexity * 0.25 + edgeDensity * 0.2 + luminanceContrast * 0.2 + meanSaturation * 0.15 + resolutionProxy * 0.1 + textureComplexity * 0.1
  ).toFixed(4));
  const weatherBonus = context2.weather.condition === "stormy" ? 0.08 : context2.weather.condition === "clear" ? 0.03 : context2.weather.condition === "snowy" ? 0.05 : 0;
  const timeBonus = context2.timeOfDay === "dawn" ? 0.04 : context2.timeOfDay === "night" ? 0.06 : 0;
  const contextModifier = parseFloat(Math.min(0.15, weatherBonus + timeBonus).toFixed(4));
  return {
    tropeSignal: tropeHint,
    tropeStrength: "weak",
    // Image tropes are softer signals than audio
    ars,
    contextModifier,
    arsAdjusted: parseFloat(Math.min(1, ars + contextModifier).toFixed(4)),
    evolutionProxy: resolutionProxy,
    intelligence: parseFloat(Math.min(1, colorComplexity * 0.4 + symmetryScore * 0.3 + edgeDensity * 0.3).toFixed(4)),
    bodySize: parseFloat(Math.min(1, (1 - brightness) * 0.4 + warmth * 0.3 + resolutionProxy * 0.3).toFixed(4)),
    surfaceTexture: parseFloat(textureComplexity.toFixed(4)),
    patternDetail: parseFloat(Math.min(1, edgeDensity * 0.5 + hueSpread * 0.5).toFixed(4)),
    colorPalette: Math.floor(dominantHue / 30) % 12,
    // Map hue to 0-11 like audio pitch class
    bpm: Math.round(60 + edgeDensity * 120)
  };
}
__name(buildImageIntelligence, "buildImageIntelligence");
async function extractImageSignal(imageBuffer, request) {
  const view = new Uint8Array(imageBuffer);
  const isPng = view[0] === 137 && view[1] === 80 && view[2] === 78 && view[3] === 71;
  const isJpeg = view[0] === 255 && view[1] === 216;
  if (!isPng) {
    if (isJpeg) {
      throw new Error("Only PNG images are currently supported. Please convert your JPEG to PNG and try again.");
    }
    throw new Error("Unsupported image format. Please upload a valid PNG image.");
  }
  let decoded;
  try {
    decoded = await decodePNG(imageBuffer);
  } catch (e) {
    throw new Error(`PNG decode failed: ${e.message}`);
  }
  const { pixels, width, height } = decoded;
  if (width < 10 || height < 10) throw new Error("Image too small (minimum 10x10)");
  if (width > 1e4 || height > 1e4) throw new Error("Image too large (maximum 10000x10000)");
  const visual = extractVisualFeatures(pixels, width, height);
  const creatureFeatures = mapVisualToCreatureFeatures(visual);
  const colorPalette = extractColorPalette(pixels, width, height);
  const context2 = await getImageContextEntropy(request);
  const intelligence = buildImageIntelligence(visual, creatureFeatures, context2);
  return {
    version: "1.0",
    origen: "Imagen",
    extractedAt: context2.timestamp,
    visual,
    creatureFeatures,
    colorPalette,
    context: context2,
    intelligence
  };
}
__name(extractImageSignal, "extractImageSignal");

// src/signal-auth.js
async function importKey(secret) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    // not extractable
    ["sign", "verify"]
  );
}
__name(importKey, "importKey");
function canonicalize(signal) {
  const payload = {
    version: signal.version,
    origen: signal.origen,
    extractedAt: signal.extractedAt,
    // Context entropy
    timestamp: signal.context?.timestamp,
    timeOfDay: signal.context?.timeOfDay,
    season: signal.context?.season,
    lat: signal.context?.lat,
    lon: signal.context?.lon,
    region: signal.context?.region,
    weatherCondition: signal.context?.weather?.condition,
    // Intelligence layer
    tropeSignal: signal.intelligence?.tropeSignal,
    tropeStrength: signal.intelligence?.tropeStrength,
    ars: signal.intelligence?.ars,
    arsAdjusted: signal.intelligence?.arsAdjusted
  };
  if (signal.origen === "Imagen" && signal.visual) {
    payload.dominantHue = signal.visual.dominantHue;
    payload.warmth = signal.visual.warmth;
    payload.brightness = signal.visual.brightness;
    payload.edgeDensity = signal.visual.edgeDensity;
    payload.symmetry = signal.visual.symmetryScore;
  } else if (signal.frequency && signal.time) {
    payload.spectralCentroid = signal.frequency.spectralCentroid;
    payload.rms = signal.time.rms;
    payload.bpm = signal.time.bpm;
    payload.duration = signal.time.duration;
  }
  return JSON.stringify(payload);
}
__name(canonicalize, "canonicalize");
async function signSignal(signal, secret) {
  if (!secret) return null;
  const key = await importKey(secret);
  const canonical = canonicalize(signal);
  const encoder = new TextEncoder();
  const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(canonical));
  const sigArray = Array.from(new Uint8Array(sigBytes));
  const base64 = btoa(String.fromCharCode(...sigArray));
  const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return base64url;
}
__name(signSignal, "signSignal");
async function verifySignal(signal, signature, secret) {
  if (!secret) return false;
  if (!signature) return false;
  try {
    const key = await importKey(secret);
    const canonical = canonicalize(signal);
    const encoder = new TextEncoder();
    const base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
    const binary = atob(padded);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) sigBytes[i] = binary.charCodeAt(i);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(canonical)
    );
  } catch (_) {
    return false;
  }
}
__name(verifySignal, "verifySignal");
function isSignalExpired(signal, maxAgeMs = 15 * 60 * 1e3) {
  if (!signal?.context?.timestamp) return true;
  return Date.now() - signal.context.timestamp > maxAgeMs;
}
__name(isSignalExpired, "isSignalExpired");

// src/creature-traits.js
function calculateTraits(audio) {
  const {
    energy = 0.5,
    bassEnergy = 0.5,
    midEnergy = 0.5,
    highEnergy = 0.5,
    spectralCentroid = 2e3,
    zeroCrossingRate = 0.05,
    duration = 5,
    tempo = 100,
    rms = 0.3,
    brightness = 0.5,
    warmth = 0.5,
    roughness = 0.5,
    harmonicRatio = 0.5,
    dynamicRange = 0.3,
    onsetDensity = 0.5
  } = audio;
  const complexity = Math.min(zeroCrossingRate / 0.15, 1);
  const spectralNorm = Math.min(spectralCentroid / 8e3, 1);
  return {
    // ── 1. EVOLUTION STAGE (duration) ──
    evolutionStage: calcEvolutionStage(duration),
    // ── 2. INTELLIGENCE (complexity + harmonic ratio) ──
    intelligence: calcIntelligence(complexity, harmonicRatio),
    // ── 3. TEMPERAMENT (energy + roughness) ──
    temperament: calcTemperament(energy, roughness, harmonicRatio),
    // ── 4. ECOLOGICAL ROLE (energy + duration + complexity) ──
    ecologicalRole: calcEcologicalRole(energy, duration, complexity),
    // ── 5. SOCIAL BEHAVIOR (onset density + harmonic ratio) ──
    socialBehavior: calcSocialBehavior(onsetDensity, harmonicRatio),
    // ── 6. PHYSICAL MASS (bass energy) ──
    physicalMass: calcPhysicalMass(bassEnergy),
    // ── 7. MOVEMENT STYLE (tempo) ──
    movementStyle: calcMovementStyle(tempo),
    // ── 8. SURFACE TEXTURE (roughness) ──
    surfaceTexture: calcSurfaceTexture(roughness),
    // ── 9. VISIBILITY (spectral brightness) ──
    visibility: calcVisibility(spectralNorm, brightness),
    // ── 10. BIOLUMINESCENCE (harmonic ratio + brightness) ──
    bioluminescence: calcBioluminescence(harmonicRatio, brightness),
    // ── 11. BODY SYMMETRY (onset regularity) ──
    bodySymmetry: calcBodySymmetry(onsetDensity, tempo),
    // ── 12. AGE / WEATHERING (duration + dynamic range) ──
    age: calcAge(duration, dynamicRange),
    // ── 13. EMOTIONAL RANGE (dynamic range) ──
    emotionalRange: calcEmotionalRange(dynamicRange)
  };
}
__name(calculateTraits, "calculateTraits");
function calcEvolutionStage(duration) {
  if (duration < 3) return { stage: "microscopic", label: "Microbe-scale", sizeDesc: "tiny, fits on a fingertip" };
  if (duration < 7) return { stage: "primitive", label: "Primitive", sizeDesc: "small, palm-sized" };
  if (duration < 15) return { stage: "basic", label: "Basic", sizeDesc: "cat-sized, compact" };
  if (duration < 25) return { stage: "developed", label: "Developed", sizeDesc: "dog-sized, substantial" };
  if (duration < 40) return { stage: "advanced", label: "Advanced", sizeDesc: "deer-sized, imposing" };
  return { stage: "apex", label: "Apex", sizeDesc: "massive, environment-dominating" };
}
__name(calcEvolutionStage, "calcEvolutionStage");
function calcIntelligence(complexity, harmonicRatio) {
  const score = complexity * 0.6 + harmonicRatio * 0.4;
  if (score < 0.2) return { level: "mindless", eyeDesc: "vestigial eye spots or no visible eyes, blank expression" };
  if (score < 0.35) return { level: "basic", eyeDesc: "small beady eyes, simple and unaware" };
  if (score < 0.5) return { level: "reactive", eyeDesc: "simple but attentive eyes, alert to stimuli" };
  if (score < 0.65) return { level: "aware", eyeDesc: "clear expressive eyes suggesting a thinking mind" };
  if (score < 0.8) return { level: "intelligent", eyeDesc: "bright alert eyes with visible curiosity and focus" };
  return { level: "transcendent", eyeDesc: "large luminous eyes radiating deep wisdom and ancient understanding" };
}
__name(calcIntelligence, "calcIntelligence");
function calcTemperament(energy, roughness, harmonicRatio) {
  const aggression = energy * 0.5 + roughness * 0.3 + (1 - harmonicRatio) * 0.2;
  if (aggression < 0.25) return { type: "docile", poseDesc: "relaxed and unthreatening, soft body language" };
  if (aggression < 0.45) return { type: "gentle", poseDesc: "calm and approachable, open posture" };
  if (aggression < 0.6) return { type: "alert", poseDesc: "watchful and ready, weight shifted slightly forward" };
  if (aggression < 0.75) return { type: "fierce", poseDesc: "tense and coiled, muscles visible beneath the surface" };
  return { type: "aggressive", poseDesc: "bristling with energy, body angled forward, intense focus" };
}
__name(calcTemperament, "calcTemperament");
function calcEcologicalRole(energy, duration, complexity) {
  const power = energy * 0.4 + Math.min(duration / 40, 1) * 0.3 + complexity * 0.3;
  if (power < 0.3) return { role: "prey", roleDesc: "small and defensive, built for evasion and hiding, compact and low to the ground" };
  if (power < 0.55) return { role: "forager", roleDesc: "resourceful and curious, medium build, adaptable body designed for exploring and gathering" };
  if (power < 0.8) return { role: "predator", roleDesc: "built to hunt, muscular and focused, sharp features and powerful limbs" };
  return { role: "apex", roleDesc: "massive and dominant, calm because nothing threatens it, ancient presence and effortless power" };
}
__name(calcEcologicalRole, "calcEcologicalRole");
function calcSocialBehavior(onsetDensity, harmonicRatio) {
  const social = onsetDensity * 0.5 + harmonicRatio * 0.5;
  if (social < 0.25) return { type: "solitary", socialDesc: "lone creature, self-sufficient, territorial" };
  if (social < 0.5) return { type: "pair", socialDesc: "bonds with one companion, protective" };
  if (social < 0.75) return { type: "pack", socialDesc: "small group creature, cooperative" };
  return { type: "swarm", socialDesc: "colony organism, one of many, collective intelligence" };
}
__name(calcSocialBehavior, "calcSocialBehavior");
function calcPhysicalMass(bassEnergy) {
  if (bassEnergy < 0.25) return { mass: "lightweight", massDesc: "delicate and lightweight, thin limbs, airy build" };
  if (bassEnergy < 0.5) return { mass: "agile", massDesc: "lean and agile, balanced proportions, quick" };
  if (bassEnergy < 0.75) return { mass: "sturdy", massDesc: "solid and sturdy, thick limbs, grounded build" };
  return { mass: "massive", massDesc: "dense and heavy, thick plating or bulk, immovable presence" };
}
__name(calcPhysicalMass, "calcPhysicalMass");
function calcMovementStyle(tempo) {
  if (tempo < 60) return { style: "sessile", moveDesc: "stationary or barely mobile, rooted, anchored" };
  if (tempo < 90) return { style: "lumbering", moveDesc: "slow deliberate movement, heavy footfalls" };
  if (tempo < 130) return { style: "flowing", moveDesc: "smooth graceful movement, fluid and continuous" };
  if (tempo < 170) return { style: "darting", moveDesc: "quick bursts of movement, sharp direction changes" };
  return { style: "flickering", moveDesc: "near-instantaneous movement, almost teleporting, blurred edges" };
}
__name(calcMovementStyle, "calcMovementStyle");
function calcSurfaceTexture(roughness) {
  if (roughness < 0.2) return { texture: "smooth", textureDesc: "smooth glossy skin, sleek membrane, or soft fur" };
  if (roughness < 0.4) return { texture: "fine", textureDesc: "fine-grained scales, soft feathers, or downy coat" };
  if (roughness < 0.6) return { texture: "textured", textureDesc: "visible scales, bark-like patches, or ridged hide" };
  if (roughness < 0.8) return { texture: "rough", textureDesc: "heavy chitinous plates, rough stone-like armor, or coarse spines" };
  return { texture: "jagged", textureDesc: "sharp crystalline protrusions, cracked volcanic plating, or razor-edged scales" };
}
__name(calcSurfaceTexture, "calcSurfaceTexture");
function calcVisibility(spectralNorm, brightness) {
  const vis = spectralNorm * 0.5 + brightness * 0.5;
  if (vis < 0.3) return { type: "stealthy", visDesc: "muted colors, low-contrast markings, built to blend into surroundings" };
  if (vis < 0.6) return { type: "balanced", visDesc: "natural coloring with some distinctive markings" };
  return { type: "bold", visDesc: "vivid saturated colors, high-contrast patterns, impossible to miss" };
}
__name(calcVisibility, "calcVisibility");
function calcBioluminescence(harmonicRatio, brightness) {
  const glow = harmonicRatio * 0.6 + brightness * 0.4;
  if (glow < 0.3) return { intensity: "none", glowDesc: "no visible glow or bioluminescence" };
  if (glow < 0.5) return { intensity: "faint", glowDesc: "faint inner glow visible in dim light, subtle luminous markings" };
  if (glow < 0.7) return { intensity: "moderate", glowDesc: "clearly glowing markings and patches, soft light emanating from within" };
  return { intensity: "intense", glowDesc: "intensely bioluminescent, body radiates light, visible glow patterns across the entire form" };
}
__name(calcBioluminescence, "calcBioluminescence");
function calcBodySymmetry(onsetDensity, tempo) {
  const regularity = tempo > 60 && tempo < 180 ? 1 - Math.abs(onsetDensity - 0.5) * 2 : 0.3;
  if (regularity > 0.65) return { type: "bilateral", symDesc: "clean bilateral symmetry, mirrored left-right body plan" };
  if (regularity > 0.4) return { type: "mostly", symDesc: "mostly symmetrical with subtle organic asymmetry" };
  return { type: "asymmetric", symDesc: "organic asymmetric form, uneven growths, natural irregularity" };
}
__name(calcBodySymmetry, "calcBodySymmetry");
function calcAge(duration, dynamicRange) {
  const age = Math.min(duration / 40, 1) * 0.6 + dynamicRange * 0.4;
  if (age < 0.25) return { stage: "juvenile", ageDesc: "young and fresh, smooth unblemished surfaces, bright clean colors" };
  if (age < 0.5) return { stage: "adult", ageDesc: "mature and fully formed, some wear and character in the surface" };
  if (age < 0.75) return { stage: "elder", ageDesc: "old and weathered, scarring and moss, faded markings, experienced presence" };
  return { stage: "ancient", ageDesc: "primordially ancient, encrusted with age, fossil-like features, timeless" };
}
__name(calcAge, "calcAge");
function calcEmotionalRange(dynamicRange) {
  if (dynamicRange < 0.25) return { range: "stoic", emotionDesc: "stoic and unreadable, minimal expression" };
  if (dynamicRange < 0.5) return { range: "calm", emotionDesc: "calm and steady, subtle emotional cues" };
  if (dynamicRange < 0.75) return { range: "expressive", emotionDesc: "expressive and animated, visible emotional state" };
  return { range: "dramatic", emotionDesc: "intensely dramatic presence, every feature communicates emotion" };
}
__name(calcEmotionalRange, "calcEmotionalRange");
function formatTraitsForAI(traits, taxonomy) {
  const secondaryLine = taxonomy.secondaryMorphology ? `
Secondary Morphology: ${taxonomy.secondaryMorphology} (FEATURE DONOR \u2014 use cross-morphology fusion rules)` : "";
  return `CREATURE IDENTITY PROFILE:
Origen: ${taxonomy.origen}
Trope: ${taxonomy.trope}
Rarity: ${taxonomy.rarity}
Morphology: ${taxonomy.morphologyName}${secondaryLine}
Domain: ${taxonomy.domain}

AUDIO-DERIVED TRAITS:
- Size: ${traits.evolutionStage.label} \u2014 ${traits.evolutionStage.sizeDesc}
- Intelligence: ${traits.intelligence.level} \u2014 ${traits.intelligence.eyeDesc}
- Temperament: ${traits.temperament.type} \u2014 ${traits.temperament.poseDesc}
- Ecological role: ${traits.ecologicalRole.role} \u2014 ${traits.ecologicalRole.roleDesc}
- Social: ${traits.socialBehavior.type} \u2014 ${traits.socialBehavior.socialDesc}
- Mass: ${traits.physicalMass.mass} \u2014 ${traits.physicalMass.massDesc}
- Movement: ${traits.movementStyle.style} \u2014 ${traits.movementStyle.moveDesc}
- Surface: ${traits.surfaceTexture.texture} \u2014 ${traits.surfaceTexture.textureDesc}
- Visibility: ${traits.visibility.type} \u2014 ${traits.visibility.visDesc}
- Bioluminescence: ${traits.bioluminescence.intensity} \u2014 ${traits.bioluminescence.glowDesc}
- Symmetry: ${traits.bodySymmetry.type} \u2014 ${traits.bodySymmetry.symDesc}
- Age: ${traits.age.stage} \u2014 ${traits.age.ageDesc}
- Emotional range: ${traits.emotionalRange.range} \u2014 ${traits.emotionalRange.emotionDesc}

COLOR:
- Palette: ${taxonomy.colorPalette.join(", ") || "warm gold, soft cream, muted blue"}
- Pattern: ${taxonomy.colorPattern || "natural gradient"}`;
}
__name(formatTraitsForAI, "formatTraitsForAI");

// src/dr-kai.js
var KIDS_SYSTEM_PROMPT = `You are Dr. Kai, a creature field guide illustrator for a children's collectible card game. Describe a creature in a few sentences. The image TEMPLATE handles style, framing, proportions, and lighting \u2014 you handle ONLY the creature.

RETURN FORMAT (JSON only, no markdown):
{"creature_description":"2-3 sentences: anatomy + materials + pose","color_palette":"specific colors","patterning":"pattern description","name":"CREATURENAME","flavor_text":"max 15 words","threat_level":15}

CREATURE_DESCRIPTION covers:
1. What it IS \u2014 body shape, what real animals it draws from
2. What it's MADE OF \u2014 fur, scales, skin, feathers (texture and feel)
3. How it's POSED \u2014 sitting, crouching, swimming, perched

CREATURE RULES:
- Pull anatomy from as many real animals as you want \u2014 the result must look like ONE cohesive species
- Everything is SMALL, CUTE, COMPACT, ROUNDED. Never large or scary.
- TROPE = adaptation layer on whatever animal you pick:
  Terratrope: stone patches, pebble textures, sandy coloring, mineral nubs
  Aquatrope: fin features, wet sheen, gill hints, coral/shell accents
  Aerotrope: feathery tufts, wind-swept fur, tiny wing nubs, cloud-soft textures
  Pyrotrope: warm sandy/ember coloring, charred-edge markings, desert textures
  Floratrope: moss patches, tiny mushrooms, flower buds, leaf ears, vine accents
  Prismatrope: crystal nubs, prismatic sheen, geode-like patches
- RARITY controls complexity:
  ABUNDANT: Simple animal + ONE subtle trope hint. Patterning: minimal.
  ENDEMIC: Creative chimera (2-3 sources) + visible trope features + ONE grown feature. Structured patterning.
  HOLOTYPE: Full chimera freedom. Bold patterning (name the real animal source). Spectacular.
- BANNED: scary, aggressive, spiny, quilled, prickly, armored, large, imposing, glowing, emanating
- Name: creative compound word (EMBERFOX, TIDEFOX, MOSSCURL) \u2014 NEVER a taxonomy term`;
var TWEEN_SYSTEM_PROMPT = `You are Dr. Kai, a xenozoologist cataloging powerful creatures for a collectible card bestiary. Describe a creature in a few sentences. The image TEMPLATE handles style, framing, environment, and constraints \u2014 you handle ONLY the creature.

RETURN FORMAT (JSON only, no markdown):
{"creature_description":"2-4 sentences: anatomy + materials + pose","eyes":"specific eye description","color_palette":"specific colors","patterning":"pattern description","name":"CREATURENAME","flavor_text":"max 15 words","threat_level":55}

CREATURE_DESCRIPTION covers:
1. What it IS \u2014 body shape, animal hybrid sources, build, weight
2. What it's MADE OF \u2014 plates, scales, bark, feathers, hide (texture, wear, damage)
3. How it's POSED \u2014 territorial stance, predatory posture, threat display
4. TROPE features integrated into body (moss in joints, charred plates, crystal eruptions)

EYES field: separate so the template can place it precisely. Include:
- Size (~1.2x for Common/Notable, ~1.4x for Exceptional)
- Gloss, color, pupil shape
- Expression (predatory, calculating, ancient wisdom)

CREATURE RULES:
- EVERY creature is MASSIVE, HEAVY-BODIED, POWERFUL. Never small or cute.
- Pull from real animals for grounded anatomy. Animal is ALWAYS the base silhouette.
- TROPE = what the creature IS BUILT FROM:
  Terratrope: stone plates, mineral veins, moss in joints, embedded pebbles
  Aquatrope: wet hide, gill slits, flipper-limbs, barnacles, hydrodynamic
  Aerotrope: feather-scales, wing membranes, crested head, talons
  Pyrotrope: charred plates, hairline cracks, heat-scarred, volcanic adaptations
  Floratrope: bark plates, moss overgrowth, fern sprouts, shelf mushrooms, vine tendons
  Prismatrope: crystal eruptions, faceted mineral growths, prismatic edge refractions
- RARITY controls complexity:
  ABUNDANT: Muted earths, weathered, battle-worn. Minimal patterning. Standard build.
  ENDEMIC: VIVID NATURAL ANIMAL COLORING. Horns/spines ~20% larger. Bold real-world patterning (name the animal: "banding like a fire salamander"). Mature alpha in peak display.
  HOLOTYPE: NOTICEABLY MORE ROBUST build. DEFINED REAL-WORLD PATTERNING (name exact animal: "tessellation like crocodile osteoderms"). Fur: white/blonde/brown/red-brown/black only. 30-40% rest space. Once-in-a-generation apex.
- BANNED: gentle, friendly, cute, curious, playful, docile, small, lean, palm-sized
- BANNED: glowing, glow, emanate, radiate, luminous (eyes REFLECT light, never emit)
- Every pattern MUST name a specific real animal + pattern type + where on body
- Name: creative compound word (STONEHEART, DEPTHCLAW) \u2014 NEVER a taxonomy term`;
async function describeCreature(traitBlock, env2, cardStyle = "tween") {
  const apiKey = env2.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  const systemPrompt = cardStyle === "kids" ? KIDS_SYSTEM_PROMPT : TWEEN_SYSTEM_PROMPT;
  const reminder = cardStyle === "kids" ? '\n\nREMINDER: Return {"creature_description","color_palette","patterning","name","flavor_text","threat_level"}. SMALL, CUTE, ROUNDED. Trope = adaptation layer. Rarity = complexity. Must start with {"creature_description".' : '\n\nREMINDER: Return {"creature_description","eyes","color_palette","patterning","name","flavor_text","threat_level"}. MASSIVE, HEAVY, TERRITORIAL. No glow. Patterns name real animals. Must start with {"creature_description".';
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: cardStyle === "kids" ? 400 : 500,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: traitBlock + reminder }
      ]
    })
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Dr. Kai failed (${resp.status}): ${errBody}`);
  }
  const result = await resp.json();
  const text = result.choices?.[0]?.message?.content || "";
  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(clean);
    console.log("[Dr. Kai]", cardStyle, "| Keys:", Object.keys(parsed).join(", "));
    return {
      name: parsed.name || "UNKNOWN",
      flavor_text: parsed.flavor_text || "",
      threat_level: parsed.threat_level || (cardStyle === "kids" ? 15 : 50),
      kidsFields: cardStyle === "kids" ? {
        creature_description: parsed.creature_description || "",
        color_palette: parsed.color_palette || "",
        patterning: parsed.patterning || ""
      } : null,
      tweenFields: cardStyle !== "kids" ? {
        creature_description: parsed.creature_description || parsed.description || "",
        eyes: parsed.eyes || "",
        color_palette: parsed.color_palette || "",
        patterning: parsed.patterning || ""
      } : null
    };
  } catch (e) {
    console.error("[Dr. Kai] Parse error:", e.message, "Raw:", text.slice(0, 200));
    return { name: "UNKNOWN", flavor_text: "", threat_level: 25, kidsFields: null, tweenFields: null };
  }
}
__name(describeCreature, "describeCreature");

// src/index.js
var CORS_HEADERS2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS2, "Content-Type": "application/json" }
  });
}
__name(json2, "json");
function err(message, status = 400) {
  return json2({ error: message }, status);
}
__name(err, "err");
async function getAuthUser(request, env2) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  let payload;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    payload = JSON.parse(atob(parts[1]));
  } catch (e) {
    return null;
  }
  try {
    const authUrl = `${env2.SUPABASE_URL}/auth/v1/user`;
    const resp = await fetch(authUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": env2.SUPABASE_SERVICE_ROLE_KEY || env2.SUPABASE_SERVICE_KEY
      }
    });
    if (!resp.ok) {
      console.warn("[Auth] Token invalid or user deleted/revoked");
      return null;
    }
    const userData = await resp.json();
    return userData.id || payload.sub;
  } catch (e) {
    console.error("[Auth] Real-time validation failed:", e.message);
    return payload.sub;
  }
}
__name(getAuthUser, "getAuthUser");
async function handleExtract(request, env2) {
  let audioBuffer;
  try {
    audioBuffer = await request.arrayBuffer();
  } catch (e) {
    return err("Could not read audio body");
  }
  if (!audioBuffer || audioBuffer.byteLength < 44) {
    return err("Audio body too small \u2014 minimum valid WAV is 44 bytes");
  }
  if (audioBuffer.byteLength > 50 * 1024 * 1024) {
    return err("Audio file too large \u2014 maximum 50MB");
  }
  let signal;
  try {
    signal = await extractSignal(audioBuffer, request);
  } catch (e) {
    return err(`Signal extraction failed: ${e.message}`, 422);
  }
  let signature;
  try {
    signature = await signSignal(signal, env2.SIGNAL_SECRET);
  } catch (e) {
    console.error("Signal signing error:", e);
    return err("Signal signing failed", 500);
  }
  return json2({
    success: true,
    signal,
    signature,
    expiresIn: 900
    // 15 minutes in seconds
  });
}
__name(handleExtract, "handleExtract");
async function handleExtractImage(request, env2) {
  let imageBuffer;
  try {
    imageBuffer = await request.arrayBuffer();
  } catch (e) {
    return err("Could not read image body");
  }
  if (!imageBuffer || imageBuffer.byteLength < 100) {
    return err("Image body too small");
  }
  if (imageBuffer.byteLength > 20 * 1024 * 1024) {
    return err("Image too large \u2014 maximum 20MB");
  }
  let signal;
  try {
    signal = await extractImageSignal(imageBuffer, request);
  } catch (e) {
    return err(`Image extraction failed: ${e.message}`, 422);
  }
  console.log(
    "[Image] Extracted |",
    signal.visual.width,
    "x",
    signal.visual.height,
    "| ARS:",
    signal.intelligence.arsAdjusted,
    "| Trope hint:",
    signal.intelligence.tropeSignal
  );
  let signature;
  try {
    signature = await signSignal(signal, env2.SIGNAL_SECRET);
  } catch (e) {
    console.error("Signal signing error:", e);
    return err("Signal signing failed", 500);
  }
  return json2({
    success: true,
    signal,
    signature,
    expiresIn: 900
  });
}
__name(handleExtractImage, "handleExtractImage");
async function handleGenerate(request, env2) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }
  const validErr = validateGenerateRequest(body);
  if (validErr) return err(validErr);
  const authUserId = await getAuthUser(request, env2);
  const { userId: bodyUserId, audioFeatures, traits = [] } = body;
  const userId = authUserId || bodyUserId || "anonymous";
  let colorPalette = body.colorPalette || [];
  const enforceSignal = env2.ENFORCE_SIGNAL === "true";
  const isSignal = body.signal && (body.signal.origen || body.signal.intelligence);
  if (isSignal) {
    if (env2.SIGNAL_SECRET && body.signature) {
      const valid = await verifySignal(body.signal, body.signature, env2.SIGNAL_SECRET);
      if (!valid) {
        return err("Signal signature invalid \u2014 request rejected", 401);
      }
      if (isSignalExpired(body.signal)) {
        return err("Signal expired \u2014 please re-extract from audio", 401);
      }
      console.log("[v9] Signal verified (HMAC) \u2713 | ARS:", body.signal.intelligence?.arsAdjusted);
    } else {
      console.log("[v9] Signal trusted (no HMAC) | ARS:", body.signal.intelligence?.arsAdjusted);
    }
    body._verifiedSignal = body.signal;
  } else if (enforceSignal) {
    return err("Signal required \u2014 please call /api/extract first", 401);
  } else if (!body.signal) {
    console.warn("[v9] No signal provided \u2014 falling back to client audioFeatures");
  }
  let rarity, morphology, trope, origen, stats, season, timeOfDay;
  const verifiedSignal = body._verifiedSignal;
  if (verifiedSignal) {
    const intel = verifiedSignal.intelligence;
    let serverFeatures;
    if (verifiedSignal.origen === "Imagen") {
      serverFeatures = verifiedSignal.creatureFeatures;
      origen = "Imagen";
      if (verifiedSignal.colorPalette && verifiedSignal.colorPalette.length > 0) {
        colorPalette = verifiedSignal.colorPalette;
      }
      console.log("[v8] Imagen signal | ARS:", intel.arsAdjusted, "| Trope hint:", intel.tropeSignal);
    } else {
      const freq = verifiedSignal.frequency;
      const time3 = verifiedSignal.time;
      serverFeatures = {
        energy: Math.min(1, time3.rms * 2.5),
        bassEnergy: freq.bandEnergy?.bass || freq.warmth * 0.7,
        midEnergy: freq.bandEnergy?.mid || 0.5,
        highEnergy: freq.bandEnergy?.highs || freq.brightness * 0.7,
        spectralCentroid: freq.spectralCentroid,
        zeroCrossingRate: time3.zeroCrossingRate,
        duration: time3.duration,
        tempo: time3.bpm,
        rms: time3.rms,
        brightness: freq.brightness,
        warmth: freq.warmth,
        roughness: freq.roughness,
        harmonicRatio: freq.harmonicRatio,
        dynamicRange: time3.dynamicRange,
        onsetDensity: time3.onsetDensity,
        // New spectral features for trope scoring wheel
        spectralFlatness: freq.spectralFlatness ?? 0.5,
        spectralKurtosis: freq.spectralKurtosis ?? 0,
        spectralCrest: freq.spectralCrest ?? 1,
        perceptualSharpness: freq.perceptualSharpness ?? 0.5,
        chromaStrength: freq.chromaStrength ?? 0.5,
        perceptualSpread: freq.perceptualSpread ?? 0.5,
        spectralSpread: freq.spectralSpread ?? 1e3,
        spectralRolloff: freq.spectralRolloff ?? 2e3
      };
      origen = "Resogen";
    }
    const analysis = analyzeAudio(serverFeatures);
    rarity = analysis.rarity;
    morphology = analysis.morphology;
    trope = analysis.trope;
    if (!origen) origen = analysis.origen;
    stats = generateStats(serverFeatures, parseFloat(intel.arsAdjusted) * 100);
    season = verifiedSignal.context.season;
    timeOfDay = verifiedSignal.context.timeOfDay || "day";
  } else if (body.rarity && body.morphology) {
    rarity = body.rarity;
    trope = body.trope || body.audiotropeType || selectTrope(audioFeatures || {});
    origen = body.origen || body.genType || selectOrigen("audio");
    stats = body.stats && Object.keys(body.stats).length > 0 && body.stats.power !== 50 ? body.stats : generateStats(audioFeatures || {}, 50);
    season = body.season || getSeasonFromAudio(audioFeatures || {});
    morphology = getMorphologyByName(body.morphology);
    if (!morphology) {
      morphology = {
        name: body.morphology,
        domain: body.engine?.domain || "terrestrial",
        tier: 1,
        labels: []
      };
    }
  } else {
    const analysis = analyzeAudio(audioFeatures || {});
    rarity = analysis.rarity;
    morphology = analysis.morphology;
    trope = analysis.trope;
    origen = analysis.origen;
    stats = analysis.stats;
    season = getSeasonFromAudio(audioFeatures || {});
  }
  if (!trope) trope = selectTrope(audioFeatures || {});
  if (!origen) origen = selectOrigen("audio");
  const finalTraits = traits.length > 0 ? traits : [
    morphology.domain || "terrestrial",
    rarity.toLowerCase(),
    trope.toLowerCase().replace("trope", "")
  ];
  const colorPattern = body.engine?.colorPattern || "";
  const mutationDesc = body.engine?.mutationDesc || "";
  let audioForTraits = {};
  if (body._verifiedSignal) {
    const freq = body._verifiedSignal.frequency || {};
    const time3 = body._verifiedSignal.time || {};
    audioForTraits = {
      energy: Math.min(1, (time3.rms || 0.3) * 2.5),
      bassEnergy: freq.bandEnergy?.bass || (freq.warmth || 0.5) * 0.7,
      midEnergy: freq.bandEnergy?.mid || 0.5,
      highEnergy: freq.bandEnergy?.highs || (freq.brightness || 0.5) * 0.7,
      spectralCentroid: freq.spectralCentroid || 2e3,
      zeroCrossingRate: time3.zeroCrossingRate || 0.05,
      duration: time3.duration || 5,
      tempo: time3.bpm || 100,
      rms: time3.rms || 0.3,
      brightness: freq.brightness || 0.5,
      warmth: freq.warmth || 0.5,
      roughness: freq.roughness || 0.5,
      harmonicRatio: freq.harmonicRatio || 0.5,
      dynamicRange: time3.dynamicRange || 0.3,
      onsetDensity: time3.onsetDensity || 0.5
    };
  } else if (audioFeatures) {
    audioForTraits = {
      energy: audioFeatures.energy || 0.5,
      bassEnergy: audioFeatures.bassEnergy || 0.5,
      midEnergy: audioFeatures.midEnergy || 0.5,
      highEnergy: audioFeatures.highEnergy || 0.5,
      spectralCentroid: audioFeatures.spectralCentroid || 2e3,
      zeroCrossingRate: audioFeatures.zeroCrossingRate || 0.05,
      duration: audioFeatures.duration || 5,
      tempo: audioFeatures.tempo || 100,
      rms: audioFeatures.rms || 0.3,
      brightness: audioFeatures.brightness || 0.5,
      warmth: audioFeatures.warmth || 0.5,
      roughness: audioFeatures.roughness || 0.5,
      harmonicRatio: audioFeatures.harmonicRatio || 0.5,
      dynamicRange: audioFeatures.dynamicRange || 0.3,
      onsetDensity: audioFeatures.onsetDensity || 0.5
    };
  }
  const creatureTraits = calculateTraits(audioForTraits);
  let drKaiName = "";
  let drKaiFlavorText = "";
  let threatLevel = 25;
  try {
    const traitBlock = formatTraitsForAI(creatureTraits, {
      origen,
      trope,
      rarity,
      morphologyName: morphology.name || body.morphology || "Unknown Creature",
      domain: morphology.domain || "terrestrial",
      colorPalette,
      colorPattern
    });
    const cardStyle = body.cardStyle || "tween";
    console.log("[v8] Calling Dr. Kai for", morphology.name, "|", trope, "|", rarity, "| Style:", cardStyle);
    const drKai = await describeCreature(traitBlock, env2, cardStyle);
    drKaiName = drKai.name;
    drKaiFlavorText = drKai.flavor_text;
    threatLevel = drKai.threat_level;
    var kidsFields = drKai.kidsFields || null;
    var tweenFields = drKai.tweenFields || null;
    console.log("[v8] Dr. Kai:", drKaiName, "| Threat:", threatLevel, kidsFields ? "| Kids fields: YES" : "", tweenFields ? "| Tween fields: YES" : "");
  } catch (e) {
    console.error("Dr. Kai non-fatal error:", e.message);
    var kidsFields = null;
    var tweenFields = null;
  }
  const creatureId = crypto.randomUUID();
  const serialId = generateCreatureId();
  const prompt = buildCreaturePrompt({
    morphologyName: morphology.name || body.morphology || "Unknown Creature",
    creatureName: drKaiName,
    origen,
    trope,
    rarity,
    cardStyle: body.cardStyle || "tween",
    kidsFields,
    tweenFields
  });
  console.log("[v8] Prompt built |", origen, "\xB7", trope, "\xB7", rarity, "|", drKaiName || morphology.name, "| Length:", prompt.length);
  let imageBytes;
  try {
    imageBytes = await generateImage(prompt, env2);
  } catch (e) {
    console.error("Image generation error:", e);
    return err(`Image generation failed: ${e.message}`, 500);
  }
  const creatureFileName = `creatures/${creatureId}-creature.png`;
  let creatureUrl;
  try {
    creatureUrl = await uploadToB2(imageBytes, creatureFileName, "image/png", env2);
  } catch (e) {
    console.error("B2 upload error:", e);
    return err(`Storage upload failed: ${e.message}`, 500);
  }
  let suggestedName = drKaiName || "";
  let flavorText = drKaiFlavorText || "";
  if (!suggestedName) {
    try {
      const suggestion = await suggestName({
        morphologyName: morphology.name || body.morphology,
        trope,
        origen,
        rarity,
        traits: finalTraits,
        season
      }, env2);
      suggestedName = suggestion.name;
      flavorText = suggestion.flavor_text || flavorText;
    } catch (e) {
      console.log("Sorting Hat non-fatal error:", e.message);
    }
  }
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (!isUUID) {
    console.warn("[v9] Invalid user_id format:", userId);
  }
  try {
    const intel = verifiedSignal?.intelligence || {};
    const ctx = verifiedSignal?.context || {};
    await createCreature(env2, {
      creature_id: creatureId,
      serial_number: serialId,
      userId: isUUID ? userId : null,
      creature_url: creatureUrl,
      image_url: creatureUrl,
      rarity,
      morphology: morphology.name || body.morphology,
      tier: morphology.tier || "1",
      domain: morphology.domain || "terrestrial",
      trope,
      origen,
      ars: intel.arsAdjusted || 0.5,
      element: deriveElement(verifiedSignal || {}),
      region: ctx.region || "Unknown",
      climate: ctx.weather?.condition || "Temperate",
      season,
      traits: finalTraits,
      stats,
      flavorText,
      creature_name: suggestedName,
      prompt_text: prompt,
      prompt_hash: `p-${creatureId.slice(0, 8)}`,
      waveform_hash: `w-${creatureId.slice(0, 8)}`,
      features: verifiedSignal?.intelligence || {},
      visuals: verifiedSignal?.visual || {},
      audio_source: verifiedSignal?.origen === "Imagen" ? "upload" : "record",
      fingerprint: body.fingerprint || null,
      seed: body.seed || null,
      mode: body.mode || "creature",
      style: body.cardStyle || "realistic",
      is_public: body.is_public !== void 0 ? body.is_public : true,
      frame_variant: body.frame_variant || "standard"
    });
  } catch (e) {
    console.error("Supabase error:", e);
    return err(`Database Save Failed: ${e.message}`, 500);
  }
  return json2({
    success: true,
    id: creatureId,
    creature_id: creatureId,
    creature_url: creatureUrl,
    rarity,
    morphology: morphology.name || body.morphology,
    trope,
    origen,
    threat_level: threatLevel,
    creature_traits: {
      evolution: creatureTraits.evolutionStage?.label,
      intelligence: creatureTraits.intelligence?.level,
      temperament: creatureTraits.temperament?.type,
      ecological_role: creatureTraits.ecologicalRole?.role,
      social: creatureTraits.socialBehavior?.type,
      mass: creatureTraits.physicalMass?.mass,
      movement: creatureTraits.movementStyle?.style,
      texture: creatureTraits.surfaceTexture?.texture,
      visibility: creatureTraits.visibility?.type,
      bioluminescence: creatureTraits.bioluminescence?.intensity,
      symmetry: creatureTraits.bodySymmetry?.type,
      age: creatureTraits.age?.stage,
      emotion: creatureTraits.emotionalRange?.range
    },
    // Legacy fields for frontend compatibility
    audiotrope_type: trope,
    gen_type: origen,
    traits: finalTraits,
    stats,
    flavor_text: flavorText,
    suggested_name: suggestedName,
    season,
    labels: morphology.labels || [],
    signal_verified: !!verifiedSignal,
    // Debug — Dr. Kai output + FULL IMAGE PROMPT (visible in browser console)
    _debug: {
      drKaiDescription: kidsFields ? JSON.stringify(kidsFields).slice(0, 500) : tweenFields ? JSON.stringify(tweenFields).slice(0, 500) : "",
      drKaiName: suggestedName,
      imagePrompt: prompt || "",
      promptLength: prompt?.length || 0,
      trope,
      origen,
      rarity,
      morphology: morphology.name,
      threatLevel,
      cardStyle: body.cardStyle || "NOT SET",
      kidsMode: !!kidsFields
    }
  });
}
__name(handleGenerate, "handleGenerate");
async function handleCompose(request, env2) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }
  const validErr = validateComposeRequest(body);
  if (validErr) return err(validErr);
  const {
    creature_id,
    creature_url,
    creature_name,
    userId,
    rarity = "Common",
    morphology = "",
    audiotrope_type = "",
    traits = [],
    stats = { power: 50, agility: 50, defense: 50, arcana: 50 },
    flavor_text = "",
    season = "spring",
    labels = []
  } = body;
  const authUserId = await getAuthUser(request, env2);
  const effectiveUserId = authUserId || userId;
  const trimmedName = creature_name.trim();
  try {
    await finalizeCreature(env2, creature_id, {
      creature_name: trimmedName,
      card_url: ""
    });
  } catch (e) {
    console.error("Supabase finalize error (non-fatal):", e);
  }
  return json2({
    success: true,
    creature_id,
    creature_name: trimmedName
  });
}
__name(handleCompose, "handleCompose");
function handleHealth(env2) {
  const checks = {
    worker: "ok",
    browser: env2.BROWSER ? "bound" : "MISSING",
    // replicate removed — using openai-image.js directly
    openai: env2.OPENAI_API_KEY ? "configured" : "MISSING \u2014 add OPENAI_API_KEY",
    b2: env2.B2_KEY_ID ? "configured" : "MISSING",
    supabase: env2.SUPABASE_URL ? "configured" : "MISSING",
    signalSecret: env2.SIGNAL_SECRET ? "configured" : "MISSING \u2014 add via wrangler secret put SIGNAL_SECRET",
    enforceSignal: env2.ENFORCE_SIGNAL || "false",
    environment: env2.ENVIRONMENT || "unknown",
    version: "v8.0.0"
  };
  return json2({ status: "ok", checks });
}
__name(handleHealth, "handleHealth");
var src_default = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS2 });
    }
    if (url.pathname === "/health") {
      return handleHealth(env2);
    }
    if (url.pathname === "/api/extract" && method === "POST") {
      return handleExtract(request, env2);
    }
    if (url.pathname === "/api/extract-image" && method === "POST") {
      return handleExtractImage(request, env2);
    }
    if (url.pathname === "/api/generate" && method === "POST") {
      return handleGenerate(request, env2);
    }
    if (url.pathname === "/api/compose" && method === "POST") {
      return handleCompose(request, env2);
    }
    if (url.pathname.startsWith("/api/creatures/") && method === "GET") {
      const creatureId = url.pathname.replace("/api/creatures/", "");
      try {
        const creature = await getCreature(env2, creatureId);
        if (!creature) return err("Creature not found", 404);
        return json2(creature);
      } catch (e) {
        return err(`Failed to fetch creature: ${e.message}`, 500);
      }
    }
    if (url.pathname === "/api/save-card" && method === "POST") {
      return handleSaveCard(request, env2);
    }
    if (url.pathname.startsWith("/api/image/") && method === "GET") {
      const bucket = env2.B2_BUCKET_NAME || "aumage-cards";
      const b2Url = `https://f005.backblazeb2.com/file/${bucket}/${imagePath}`;
      try {
        const resp = await fetch(b2Url);
        if (!resp.ok) return json2({ error: "Image not found" }, 404);
        const headers = new Headers(resp.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Cache-Control", "public, max-age=31536000");
        return new Response(resp.body, { status: 200, headers });
      } catch (e) {
        return json2({ error: "Image proxy failed" }, 500);
      }
    }
    return json2({ error: "Not found" }, 404);
  }
};
function deriveElement(signal) {
  const freq = signal.frequency || {};
  const time3 = signal.time || {};
  const warmth = freq.warmth || 0.5;
  const brightness = freq.brightness || 0.5;
  const intensity = time3.rms ? Math.min(1, time3.rms * 2.5) : 0.5;
  const harmony = freq.harmonicRatio || 0.5;
  const roughness = freq.roughness || 0.5;
  if (warmth > 0.7 && intensity > 0.6) return "fire";
  if (warmth < 0.3 && brightness > 0.5) return "ice";
  if (intensity > 0.7 && roughness > 0.5) return "storm";
  if (warmth > 0.4 && warmth < 0.6 && brightness < 0.4) return "earth";
  if (intensity < 0.35 && harmony > 0.5) return "water";
  if (harmony > 0.65 && brightness > 0.6) return "light";
  if (brightness < 0.35 && harmony < 0.4) return "shadow";
  if (warmth > 0.55) return "nature";
  return "storm";
}
__name(deriveElement, "deriveElement");

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-6tM6IY/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-6tM6IY/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
