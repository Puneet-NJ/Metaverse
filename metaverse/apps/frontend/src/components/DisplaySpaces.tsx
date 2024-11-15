import useGetAllSpaces from "@/hooks/useGetAllSpaces";
import { Link } from "react-router-dom";

interface Space {
	id: string;
	name: string;
	dimensions: string;
	thumbnail: string;
}

export const DisplaySpaces = () => {
	const { spaces, loading } = useGetAllSpaces();

	if (loading) return <div>loading...</div>;
	return (
		<div className="text-left flex gap-7 flex-wrap">
			{spaces.map((space: Space) => {
				return (
					<Link
						to={"/play/" + space.id}
						key={space.id}
						className="p-20 bg-gray-500"
					>
						<div>{space.id}</div>

						<div>{space.name}</div>
						<div>{space.dimensions}</div>
						<div>{space.thumbnail}</div>
					</Link>
				);
			})}
		</div>
	);
};
