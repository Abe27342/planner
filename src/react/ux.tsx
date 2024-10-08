/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Conference } from "../schema/app_schema.js";
import { ClientSession } from "../schema/session_schema.js";
import "../output.css";
import { IFluidContainer, IMember, IServiceAudience, TreeView } from "fluid-framework";
import { Canvas } from "./canvas_ux.js";
import { undoRedo } from "../utils/undo.js";
import { Header } from "./header_ux.js";

export function ReactApp(props: {
	conferenceTree: TreeView<typeof Conference>;
	sessionTree: TreeView<typeof ClientSession>;
	audience: IServiceAudience<IMember>;
	container: IFluidContainer;
	undoRedo: undoRedo;
	insertTemplate: (prompt: string) => Promise<void>;
}): JSX.Element {
	const [currentUser, setCurrentUser] = useState<IMember | undefined>(undefined);
	const [connectionState, setConnectionState] = useState("");
	const [saved, setSaved] = useState(false);
	const [fluidMembers, setFluidMembers] = useState<IMember[]>([]);

	/** Unsubscribe to undo-redo events when the component unmounts */
	useEffect(() => {
		return props.undoRedo.dispose;
	}, []);

	/** Update the fluidMembers array whenever the audience changes */
	useEffect(() => {
		// convert the audience values to an array of IMember objects
		setFluidMembers(Array.from(props.audience.getMembers().values()));
		setCurrentUser(props.audience.getMyself());
		// subscribe to audience changes
		props.audience.on("membersChanged", () => {
			// convert the audience values to an array of IMember objects
			setFluidMembers(Array.from(props.audience.getMembers().values()));
			setCurrentUser(props.audience.getMyself());
		});
	}, []);

	return (
		<>
			<div
				id="main"
				className="flex flex-col bg-gray-100 h-screen w-full overflow-hidden overscroll-none"
			>
				<Header
					saved={saved}
					connectionState={connectionState}
					fluidMembers={fluidMembers}
					currentUser={currentUser}
					insertTemplate={props.insertTemplate}
				/>
				<div className="flex h-[calc(100vh-48px)] flex-row ">
					<Canvas
						conferenceTree={props.conferenceTree}
						sessionTree={props.sessionTree}
						audience={props.audience}
						container={props.container}
						fluidMembers={fluidMembers}
						currentUser={currentUser}
						undoRedo={props.undoRedo}
						setCurrentUser={setCurrentUser}
						setConnectionState={setConnectionState}
						setSaved={setSaved}
						setFluidMembers={setFluidMembers}
					/>
				</div>
			</div>
		</>
	);
}
