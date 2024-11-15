import { logo } from "@/assets/ImagesLink";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import useSignupForm from "@/hooks/useSignupForm";

export const Signupcard = () => {
	const { handleChange, onSubmit } = useSignupForm();

	return (
		<div className="bg-white w-1/3 p-10 text-black border-2 shadow-xl rounded-md">
			<div className="w-32 mx-auto mb-10">
				<img src={logo} />
			</div>

			<div className="flex flex-col gap-10 text-left">
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="email">Username</Label>
					<Input
						type="email"
						id="email"
						placeholder="johndoe@123"
						onChange={(e) => {
							handleChange({ username: e.target.value });
						}}
					/>
				</div>

				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="password">Password</Label>
					<Input
						type="password"
						id="password"
						onChange={(e) => {
							handleChange({ password: e.target.value });
						}}
					/>
				</div>

				<Button onClick={onSubmit}>Sign up</Button>
			</div>
		</div>
	);
};
