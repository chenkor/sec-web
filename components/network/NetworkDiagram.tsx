"use client";

import { useId, useMemo, useState } from "react";

type Mode = {
  internet: boolean;
  tor: boolean;
  torOnly: boolean;
  bluetooth: boolean;
};

function scene(m: Mode) {
  const online = m.internet;
  const viaTor = online && m.tor;
  const viaNet = online && !m.tor;
  const btLive = m.bluetooth && !online;
  const btStandby = m.bluetooth && online;
  const stuck = !online && !m.bluetooth;

  let title = "Encrypted on your phone, carried by relays";
  let body =
    "SEC never runs a chat server. Your phone encrypts the message, public relays only pass it along, and your friend’s phone unlocks it. Relays can’t read it.";

  if (stuck) {
    title = "Waiting on the phone";
    body =
      "No internet and no Bluetooth, so the message stays on the device until a path opens again.";
  } else if (btLive) {
    title = "Internet down: phones link over Bluetooth";
    body =
      "When Wi‑Fi and mobile data are gone, SEC switches to a nearby Bluetooth path. Relays are out of reach; phones pass the encrypted message directly.";
  } else if (viaTor && m.torOnly) {
    title = "Relays only through Tor";
    body =
      "The phone reaches relays through Tor built into the app, and won’t use a normal connection as backup.";
  } else if (viaTor && btStandby) {
    title = "Tor to the relays · Bluetooth on standby";
    body =
      "Traffic to relays goes through Tor. Bluetooth stays ready for when the network drops. Turn Internet off to see that handoff.";
  } else if (viaTor) {
    title = "Relays through Tor";
    body =
      "Same public relays, but the phone reaches them through Tor. If Tor fails and Tor only is off, SEC can fall back to a normal connection.";
  } else if (btStandby) {
    title = "Clearnet path · Bluetooth on standby";
    body =
      "Relays over a normal connection (Tor off). Bluetooth is armed for when the network disappears. That’s the Android fallback.";
  }

  return { online, viaTor, viaNet, btLive, btStandby, stuck, title, body };
}

function Toggle({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`net-toggle${disabled ? " is-disabled" : ""}${checked ? " is-on" : ""}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="net-toggle__box" aria-hidden />
      <span className="net-toggle__label">{label}</span>
    </label>
  );
}

function Dot({
  on,
  kind,
  delay = 0,
}: {
  on: boolean;
  kind: "net" | "tor" | "bt";
  delay?: number;
}) {
  if (!on) return null;
  return (
    <span
      className={`net-dot net-dot--${kind}`}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden
    />
  );
}

function Device({
  name,
  points,
  live,
}: {
  name: string;
  points: [string, string];
  live: boolean;
}) {
  return (
    <div className={`net-device${live ? " is-live" : ""}`}>
      <div className="net-device__name">{name}</div>
      <ul className="net-device__points">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

export function NetworkDiagram() {
  const uid = useId();
  const [mode, setMode] = useState<Mode>({
    internet: true,
    tor: false,
    torOnly: false,
    bluetooth: false,
  });

  const s = useMemo(() => scene(mode), [mode]);
  const live = !s.stuck;

  const relayTitle = !s.online
    ? "Relays"
    : s.viaTor
      ? "Relays · via Tor"
      : "Relays";

  const relaySub = !s.online
    ? "Offline: unreachable"
    : s.viaTor
      ? mode.torOnly
        ? "Can’t read messages · no direct backup"
        : "Can’t read messages · Tor tunnel"
      : "Can’t read messages · not run by SEC";

  const btLabel = s.btLive
    ? "Bluetooth · live"
    : s.btStandby
      ? "Bluetooth · standby"
      : "Bluetooth";

  return (
    <section className="net" aria-label="How SEC delivers a message">
      <div className="net__head">
        <p className="panel-label !mb-2">How it moves</p>
        <h2 className="panel-title text-[1.5rem]">{s.title}</h2>
      </div>

      <div className="net__stage">
        <div className="net__scene">
          <Device
            name="You"
            live={live}
            points={["Keys stay on the phone", "Encrypted before it leaves"]}
          />

          <div className="net__mid">
            <div
              className={`net-route${s.online ? " is-on" : ""}${s.viaTor ? " is-tor" : ""}`}
            >
              <div className="net-route__wire">
                <Dot on={s.viaNet} kind="net" />
                <Dot on={s.viaTor} kind="tor" />
                <Dot on={s.viaNet} kind="net" delay={1000} />
                <Dot on={s.viaTor} kind="tor" delay={1000} />
              </div>

              <div className="net-relay">
                <div className="net-relay__pips" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <div className="net-relay__title">{relayTitle}</div>
                <div className="net-relay__sub">{relaySub}</div>
              </div>

              <div className="net-route__wire">
                <Dot on={s.viaNet} kind="net" delay={350} />
                <Dot on={s.viaTor} kind="tor" delay={350} />
                <Dot on={s.viaNet} kind="net" delay={1350} />
                <Dot on={s.viaTor} kind="tor" delay={1350} />
              </div>
            </div>

            <div
              className={`net-route net-route--bt${s.btLive ? " is-on" : ""}${s.btStandby ? " is-standby" : ""}`}
            >
              <div className="net-route__wire">
                <Dot on={s.btLive} kind="bt" />
                <Dot on={s.btLive} kind="bt" delay={850} />
              </div>
              <div className="net-bt">
                <div className="net-bt__title">{btLabel}</div>
                <div className="net-bt__sub">
                  {s.btLive
                    ? "Nearby phones · relays skipped"
                    : s.btStandby
                      ? "Takes over if the net dies"
                      : "Off"}
                </div>
              </div>
              <div className="net-route__wire">
                <Dot on={s.btLive} kind="bt" delay={400} />
                <Dot on={s.btLive} kind="bt" delay={1250} />
              </div>
            </div>
          </div>

          <Device
            name="Friend"
            live={live}
            points={["Only their phone unlocks it", "No account in the middle"]}
          />
        </div>
      </div>

      <div className="net__controls">
        <Toggle
          id={`${uid}-net`}
          label="Internet"
          checked={mode.internet}
          onChange={(internet) =>
            setMode((m) => ({
              ...m,
              internet,
              // Offline ⇒ Bluetooth path. Tor needs IP, so it drops too.
              bluetooth: internet ? m.bluetooth : true,
              tor: internet ? m.tor : false,
              torOnly: internet ? m.torOnly : false,
            }))
          }
        />
        <Toggle
          id={`${uid}-tor`}
          label="Tor"
          checked={mode.tor}
          disabled={!mode.internet}
          onChange={(tor) =>
            setMode((m) => ({
              ...m,
              tor,
              torOnly: tor ? m.torOnly : false,
            }))
          }
        />
        <Toggle
          id={`${uid}-toronly`}
          label="Tor only"
          checked={mode.torOnly}
          disabled={!mode.internet || !mode.tor}
          onChange={(torOnly) => setMode((m) => ({ ...m, torOnly }))}
        />
        <Toggle
          id={`${uid}-bt`}
          label="Bluetooth"
          checked={mode.bluetooth}
          onChange={(bluetooth) =>
            setMode((m) => ({
              ...m,
              bluetooth,
              // Live Bluetooth means radios are down. Tor has nowhere to go.
              ...(bluetooth && !m.internet
                ? { tor: false, torOnly: false }
                : {}),
            }))
          }
        />
      </div>

      <p className="net__caption" key={s.body}>
        {s.body}
      </p>
    </section>
  );
}
